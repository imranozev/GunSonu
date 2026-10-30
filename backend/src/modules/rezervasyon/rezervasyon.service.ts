import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { DataSource, EntityManager } from 'typeorm';
import {
  DogrulamaDurumu,
  KullaniciRol,
  RezervasyonDurumu,
} from '../../common/enums';
import { REDIS } from '../../redis/redis.module';
import { Ilan } from '../ilan/ilan.entity';
import { Kullanici } from '../kullanici/kullanici.entity';
import { Rezervasyon } from './rezervasyon.entity';
import {
  REZERVASYON_KURALLARI as KURAL,
  rezervasyonAnahtari,
} from './rezervasyon.kurallari';

// KRİTİK 1: Yarış durumunu engelleyen atomik stok düşürme.
// Kontrol (kalan_adet >= adet) ve düşürme TEK sorguda yapılır. İki istek aynı
// satıra gelirse PostgreSQL satır kilidiyle sıraya sokar; ikinci istek kilidi
// aldığında WHERE koşulunu güncel değerle yeniden değerlendirir. Stok yetmiyorsa
// 0 satır güncellenir, stok asla eksiye düşmez.
const STOK_DUSUR_SQL = `
  UPDATE ilan
  SET    kalan_adet = kalan_adet - $1
  WHERE  id = $2
    AND  kalan_adet >= $1
    AND  now() < teslim_bitis
  RETURNING kalan_adet
`;

const STOK_IADE_SQL = `
  UPDATE ilan SET kalan_adet = kalan_adet + $1 WHERE id = $2
`;

// Yalnızca 'bekliyor' durumundaki kayıt kapatılabilir. Redis olayı, yedek tarama,
// kullanıcı iptali ve QR teslimi aynı anda gelse bile yalnızca biri kazanır;
// stok iki kez iade edilmez.
const KAPAT_SQL = `
  UPDATE rezervasyon
  SET    durum = $2
  WHERE  id = $1 AND durum = 'bekliyor'
    AND  ($3::uuid IS NULL OR kullanici_id = $3)
  RETURNING ilan_id, kullanici_id, adet
`;

// Eşik dolunca 7 gün askı ve sayaç sıfırlanır.
const IHLAL_SQL = `
  UPDATE kullanici
  SET ihlal_sayisi = CASE WHEN ihlal_sayisi + 1 >= $2 THEN 0 ELSE ihlal_sayisi + 1 END,
      askiya_alinma_bitis = CASE WHEN ihlal_sayisi + 1 >= $2
                                 THEN now() + make_interval(days => $3)
                                 ELSE askiya_alinma_bitis END
  WHERE id = $1
`;

const TESLIM_SQL = `
  UPDATE rezervasyon r
  SET    durum = 'teslim', teslim_zamani = now()
  FROM   ilan i JOIN isletme s ON s.id = i.isletme_id
  WHERE  r.ilan_id = i.id
    AND  r.qr_kodu = $1
    AND  s.sahip_id = $2
    AND  r.durum = 'bekliyor'
    AND  r.son_gecerlilik > now()
  RETURNING r.id, r.adet, i.urun_adi
`;

interface KapatilanRezervasyon {
  ilan_id: string;
  kullanici_id: string;
  adet: number;
}

// postgres sürücüsünde UPDATE ... RETURNING sonucu [satırlar, etkilenenSayısı] döner
type GuncellemeSonucu<T> = [T[], number];

@Injectable()
export class RezervasyonService {
  private readonly logger = new Logger(RezervasyonService.name);
  private readonly sureMs: number;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(REDIS) private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.sureMs = Number(config.get('REZERVASYON_SURESI_SN', 3600)) * 1000;
  }

  async olustur(
    kullaniciId: string,
    ilanId: string,
    adet: number,
  ): Promise<Rezervasyon> {
    if (!Number.isInteger(adet) || adet < 1) {
      throw new BadRequestException('adet en az 1 olmalı');
    }

    const rezervasyon = await this.dataSource.transaction(async (m) => {
      // Kullanıcı satırını kilitlemek aynı kişinin eşzamanlı isteklerini sıraya
      // sokar; günlük limit ve "aynı ilana tekrar" kontrolleri böylece güvenli.
      const kullanici = await m.findOne(Kullanici, {
        where: { id: kullaniciId },
        lock: { mode: 'pessimistic_write' },
      });
      this.rezervasyonYapabilirMi(kullanici);
      await this.kullaniciLimitleriniKontrolEt(m, kullaniciId, ilanId);

      const ilan = await m.findOne(Ilan, { where: { id: ilanId } });
      if (!ilan) throw new NotFoundException('İlan bulunamadı');
      if (adet > ilan.kisi_basi_limit) {
        throw new BadRequestException(
          `Bu ilandan kişi başı en fazla ${ilan.kisi_basi_limit} adet alınabilir`,
        );
      }

      const [guncellenen] = (await m.query(STOK_DUSUR_SQL, [
        adet,
        ilanId,
      ])) as GuncellemeSonucu<{ kalan_adet: number }>;
      if (guncellenen.length === 0) {
        throw new ConflictException('Ürün tükendi veya teslim süresi doldu');
      }

      // Teslim aralığı daha erken bitiyorsa rezervasyon da o zaman düşer
      const sonGecerlilik = new Date(
        Math.min(Date.now() + this.sureMs, ilan.teslim_bitis.getTime()),
      );
      return m.save(
        m.create(Rezervasyon, {
          ilan_id: ilanId,
          kullanici_id: kullaniciId,
          adet,
          qr_kodu: randomBytes(16).toString('base64url'),
          son_gecerlilik: sonGecerlilik,
        }),
      );
    });

    // KRİTİK 2: Süre sayacı Redis'te. Anahtar son_gecerlilik anında kendiliğinden
    // silinir; RezervasyonSuresiService bu olayı dinleyip stoğu iade eder.
    // Commit'ten SONRA yazılır: geri alınan bir işlem için sayaç başlamaz.
    const kalanMs = rezervasyon.son_gecerlilik.getTime() - Date.now();
    try {
      await this.redis.set(
        rezervasyonAnahtari(rezervasyon.id),
        rezervasyon.ilan_id,
        'PX',
        Math.max(kalanMs, 1),
      );
    } catch (hata) {
      // Rezervasyon geçerli kalır; süresi dolunca yedek tarama yakalar.
      this.logger.warn(`Redis sayacı yazılamadı (${rezervasyon.id}): ${hata}`);
    }
    return rezervasyon;
  }

  /** Kullanıcı vazgeçti: stok hemen iade edilir, ihlal sayılmaz. */
  async iptal(kullaniciId: string, rezervasyonId: string): Promise<void> {
    const kapatilan = await this.dataSource.transaction(async (m) => {
      const r = await this.kapat(m, rezervasyonId, RezervasyonDurumu.IPTAL, kullaniciId);
      if (!r) throw new NotFoundException('Aktif rezervasyon bulunamadı');
      return r;
    });
    await this.sayaciSil(rezervasyonId);
    this.logger.log(`İptal: ${rezervasyonId} (${kapatilan.adet} adet iade)`);
  }

  /**
   * 60 dk dolunca çağrılır (Redis olayı veya yedek tarama). Stok iade edilir,
   * kullanıcıya ihlal yazılır. Kayıt zaten kapanmışsa false döner.
   */
  async suresiDoldu(rezervasyonId: string): Promise<boolean> {
    return this.dataSource.transaction(async (m) => {
      const r = await this.kapat(m, rezervasyonId, RezervasyonDurumu.SURESI_DOLDU);
      if (!r) return false;
      await m.query(IHLAL_SQL, [
        r.kullanici_id,
        KURAL.ihlalAskiEsigi,
        KURAL.askiSuresiGun,
      ]);
      return true;
    });
  }

  /** İşletme QR kodu okuttu. Alıcının adı bilerek döndürülmez (damgalanma). */
  async teslimEt(isletmeSahibiId: string, qrKodu: string) {
    const [satirlar] = (await this.dataSource.query(TESLIM_SQL, [
      qrKodu,
      isletmeSahibiId,
    ])) as GuncellemeSonucu<{ id: string; adet: number; urun_adi: string }>;
    if (satirlar.length === 0) {
      throw new NotFoundException('Geçersiz, kullanılmış veya süresi dolmuş kod');
    }
    await this.sayaciSil(satirlar[0].id);
    return satirlar[0];
  }

  private async kapat(
    m: EntityManager,
    rezervasyonId: string,
    yeniDurum: RezervasyonDurumu,
    kullaniciId?: string,
  ): Promise<KapatilanRezervasyon | null> {
    const [satirlar] = (await m.query(KAPAT_SQL, [
      rezervasyonId,
      yeniDurum,
      kullaniciId ?? null,
    ])) as GuncellemeSonucu<KapatilanRezervasyon>;
    const r = satirlar[0];
    if (!r) return null;
    await m.query(STOK_IADE_SQL, [r.adet, r.ilan_id]);
    return r;
  }

  private async sayaciSil(rezervasyonId: string) {
    try {
      await this.redis.del(rezervasyonAnahtari(rezervasyonId));
    } catch (hata) {
      // Anahtar kalırsa süresi dolunca olay gelir; kayıt kapalı olduğu için etkisiz.
      this.logger.warn(`Redis sayacı silinemedi (${rezervasyonId}): ${hata}`);
    }
  }

  private rezervasyonYapabilirMi(kullanici: Kullanici | null) {
    if (!kullanici) throw new NotFoundException('Kullanıcı bulunamadı');
    if (kullanici.rol !== KullaniciRol.ALICI) {
      throw new ForbiddenException('Yalnızca ihtiyaç sahibi hesapları rezervasyon yapabilir');
    }
    if (kullanici.dogrulama_durumu !== DogrulamaDurumu.ONAYLI) {
      throw new ForbiddenException('Hesabınız henüz kurum tarafından onaylanmadı');
    }
    if (kullanici.askiya_alinma_bitis && kullanici.askiya_alinma_bitis > new Date()) {
      throw new ForbiddenException(
        `Hesabınız ${kullanici.askiya_alinma_bitis.toISOString()} tarihine kadar askıda`,
      );
    }
  }

  private async kullaniciLimitleriniKontrolEt(
    m: EntityManager,
    kullaniciId: string,
    ilanId: string,
  ) {
    const [{ bugun, bu_ilan }] = await m.query(
      `SELECT
         count(*) FILTER (WHERE olusma_zamani >= date_trunc('day', now())
                            AND durum IN ('bekliyor', 'teslim'))::int AS bugun,
         count(*) FILTER (WHERE ilan_id = $2)::int AS bu_ilan
       FROM rezervasyon WHERE kullanici_id = $1`,
      [kullaniciId, ilanId],
    );
    if (bu_ilan > 0) {
      throw new ConflictException('Bu ilana daha önce rezervasyon yaptınız');
    }
    if (bugun >= KURAL.gunlukLimit) {
      throw new ForbiddenException(
        `Günlük rezervasyon limiti (${KURAL.gunlukLimit}) doldu`,
      );
    }
  }
}
