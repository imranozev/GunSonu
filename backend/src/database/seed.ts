import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import {
  DogrulamaDurumu,
  IlanKategori,
  IsletmeTuru,
  KullaniciRol,
} from '../common/enums';
import { Kullanici } from '../modules/kullanici/kullanici.entity';
import { Isletme } from '../modules/isletme/isletme.entity';
import { Ilan } from '../modules/ilan/ilan.entity';

// Geliştirme verisi: Bağcılar civarı 3 işletme + filtre testleri için uzak/süresi
// geçmiş/stoksuz ilanlar + yarış testi için 10 onaylı alıcı.
// Tüm tabloları boşaltır, production'da çalışmaz.

// Sabit kimlikler: `x-kullanici-id` başlığıyla elle deneme ve scripts/yaris-testi.mjs için
export const SAHIP_ID = '00000000-0000-4000-8000-000000000001';
export const aliciId = (n: number) =>
  `00000000-0000-4000-8000-0000000001${String(n).padStart(2, '0')}`;
async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed production ortamında çalıştırılamaz');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const ds = app.get(DataSource);

  await ds.query(
    'TRUNCATE degerlendirme, rezervasyon, ilan, isletme, kullanici CASCADE',
  );

  const kullaniciRepo = ds.getRepository(Kullanici);
  const sahip = await kullaniciRepo.save({
    id: SAHIP_ID,
    ad_soyad: 'Örnek İşletme Sahibi',
    telefon: '+905550000000',
    rol: KullaniciRol.ISLETME,
    dogrulama_durumu: DogrulamaDurumu.ONAYLI,
  });

  await kullaniciRepo.save(
    Array.from({ length: 10 }, (_, i) => ({
      id: aliciId(i + 1),
      ad_soyad: `Alıcı ${i + 1}`,
      telefon: `+90555000${String(i + 1).padStart(4, '0')}`,
      rol: KullaniciRol.ALICI,
      dogrulama_durumu: DogrulamaDurumu.ONAYLI,
    })),
  );

  const nokta = (enlem: number, boylam: number) => ({
    type: 'Point' as const,
    coordinates: [boylam, enlem],
  });

  const isletmeRepo = ds.getRepository(Isletme);
  const [firin, pastane, market, uzak, onaysiz] = await isletmeRepo.save([
    { sahip_id: sahip.id, ad: 'Yener Fırını', tur: IsletmeTuru.FIRIN, konum: nokta(41.0412, 28.859), adres: 'Bağcılar', kapanis_saati: '21:00', onayli_mi: true },
    { sahip_id: sahip.id, ad: 'Mahalle Pastanesi', tur: IsletmeTuru.PASTANE, konum: nokta(41.0355, 28.852), adres: 'Bağcılar', kapanis_saati: '22:00', onayli_mi: true },
    { sahip_id: sahip.id, ad: 'Köşe Market', tur: IsletmeTuru.MARKET, konum: nokta(41.0445, 28.8635), adres: 'Bağcılar', kapanis_saati: '22:30', onayli_mi: true },
    { sahip_id: sahip.id, ad: 'Kadıköy Fırını', tur: IsletmeTuru.FIRIN, konum: nokta(40.9903, 29.0290), adres: 'Kadıköy', kapanis_saati: '21:00', onayli_mi: true },
    { sahip_id: sahip.id, ad: 'Onaysız Fırın', tur: IsletmeTuru.FIRIN, konum: nokta(41.0395, 28.857), adres: 'Bağcılar', kapanis_saati: '21:00', onayli_mi: false },
  ]);

  const simdi = Date.now();
  const saatSonra = (s: number) => new Date(simdi + s * 3_600_000);
  const bugun = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, yerel saat
  const ilan = (
    isletme: Isletme,
    urun_adi: string,
    kategori: IlanKategori,
    adet: number,
    kisi_basi_limit: number,
    bitisSaat = 3,
  ) => ({
    isletme_id: isletme.id,
    urun_adi,
    kategori,
    toplam_adet: adet,
    kalan_adet: adet,
    kisi_basi_limit,
    son_tuketim_tarihi: bugun,
    teslim_baslangic: saatSonra(bitisSaat - 4),
    teslim_bitis: saatSonra(bitisSaat),
    uygunluk_beyani: true,
  });

  await ds.getRepository(Ilan).save([
    ilan(firin, 'Günlük Ekmek', IlanKategori.UNLU_MAMUL, 12, 3),
    ilan(firin, 'Simit', IlanKategori.UNLU_MAMUL, 10, 2),
    ilan(pastane, 'Poğaça', IlanKategori.UNLU_MAMUL, 8, 2),
    ilan(market, 'Yoğurt', IlanKategori.SUT_URUNU, 5, 1, 2),
    ilan(firin, 'Son Ekmekler (yarış testi)', IlanKategori.UNLU_MAMUL, 3, 1),
    // Aşağıdakiler Bağcılar sorgusunda GÖRÜNMEMELİ
    ilan(uzak, 'Ekmek (uzak)', IlanKategori.UNLU_MAMUL, 20, 3),
    ilan(onaysiz, 'Ekmek (onaysız işletme)', IlanKategori.UNLU_MAMUL, 5, 1),
    ilan(firin, 'Açma (teslim süresi geçti)', IlanKategori.UNLU_MAMUL, 4, 2, -1),
    { ...ilan(pastane, 'Kurabiye (tükendi)', IlanKategori.KURU_PASTA, 6, 2), kalan_adet: 0 },
  ]);

  console.log('Seed tamamlandı: 5 işletme, 9 ilan, 10 alıcı');
  console.log(`İşletme sahibi: ${SAHIP_ID}`);
  console.log(`Alıcılar:       ${aliciId(1)} … ${aliciId(10)}`);
  await app.close();
}

seed().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
