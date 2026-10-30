import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { REDIS, REDIS_ABONE } from '../../redis/redis.module';
import { RezervasyonService } from './rezervasyon.service';
import {
  REZERVASYON_KURALLARI as KURAL,
  anahtardanRezervasyonId,
} from './rezervasyon.kurallari';

/**
 * Süresi dolan rezervasyonları otomatik düşürür.
 *
 * Birincil yol: Redis anahtarı TTL bitince silinir ve `__keyevent@0__:expired`
 * kanalına olay yayınlanır; burada dinlenip stok iade edilir.
 *
 * Yedek yol: Redis olayları "ateşle ve unut"tur. Sunucu o an kapalıysa olay
 * kaybolur. Bu yüzden dakikada bir veritabanında süresi geçmiş 'bekliyor'
 * kayıtları da taranır. İki yol aynı anda çalışsa da KAPAT_SQL'deki durum
 * koşulu sayesinde stok yalnızca bir kez iade edilir.
 */
@Injectable()
export class RezervasyonSuresiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RezervasyonSuresiService.name);
  private zamanlayici?: NodeJS.Timeout;

  constructor(
    private readonly rezervasyonService: RezervasyonService,
    private readonly dataSource: DataSource,
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(REDIS_ABONE) private readonly abone: Redis,
  ) {}

  // Redis'i beklemez: Redis kapalıyken de sunucu açılır, yedek tarama çalışır.
  onModuleInit() {
    // Redis yeniden başlarsa ayar sıfırlanır; her bağlantıda tekrar verilir.
    this.redis.on('ready', () => {
      this.redis
        .config('SET', 'notify-keyspace-events', 'Ex')
        .catch(() =>
          this.logger.warn(
            "CONFIG SET yapılamadı; Redis'te notify-keyspace-events=Ex ayarlı olmalı",
          ),
        );
    });
    // ioredis kendisi yeniden bağlanır; her denemede log basmamak için bir kez uyar
    let uyarildi = false;
    this.redis.on('ready', () => (uyarildi = false));
    this.redis.on('error', (hata) => {
      if (uyarildi) return;
      uyarildi = true;
      this.logger.warn(`Redis'e bağlanılamıyor (${hata.message}); yedek tarama devrede`);
    });
    this.abone.on('error', () => undefined);

    const kanal = `__keyevent@${this.redis.options.db ?? 0}__:expired`;
    this.abone.on('message', (_kanal: string, anahtar: string) => {
      const id = anahtardanRezervasyonId(anahtar);
      if (id) void this.dusur(id, 'redis');
    });
    this.abone
      .subscribe(kanal)
      .then(() => this.logger.log(`Redis süre olayları dinleniyor (${kanal})`))
      .catch((hata) => this.logger.error(`Redis aboneliği başarısız: ${hata}`));

    this.zamanlayici = setInterval(() => void this.tara(), KURAL.taramaAraligiMs);
    void this.tara(); // sunucu kapalıyken dolanlar için açılışta bir kez
  }

  onModuleDestroy() {
    clearInterval(this.zamanlayici);
  }

  async tara() {
    try {
      const satirlar: { id: string }[] = await this.dataSource.query(
        `SELECT id FROM rezervasyon
         WHERE durum = 'bekliyor' AND son_gecerlilik <= now()
         LIMIT 200`,
      );
      for (const { id } of satirlar) await this.dusur(id, 'tarama');
    } catch (hata) {
      this.logger.error(`Yedek tarama başarısız: ${hata}`);
    }
  }

  private async dusur(id: string, kaynak: 'redis' | 'tarama') {
    try {
      if (await this.rezervasyonService.suresiDoldu(id)) {
        this.logger.log(`Süresi doldu (${kaynak}): ${id}, stok iade edildi`);
      }
    } catch (hata) {
      this.logger.error(`Rezervasyon düşürülemedi (${id}): ${hata}`);
    }
  }
}
