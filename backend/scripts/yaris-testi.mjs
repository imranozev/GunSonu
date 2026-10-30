// Yarış durumu gösterimi: 10 farklı alıcı, stoğu 3 olan aynı ilana AYNI ANDA
// 1'er adet rezervasyon gönderir. Beklenen: tam 3 başarılı, 7 "Ürün tükendi",
// kalan_adet = 0 (asla eksi değil).
//
// Kullanım: npm run seed && npm run start:dev, sonra
//   node scripts/yaris-testi.mjs [http://localhost:3000/api]

const API = process.argv[2] ?? 'http://localhost:3000/api';
const ILAN_ADI = 'Son Ekmekler (yarış testi)';
const aliciId = (n) => `00000000-0000-4000-8000-0000000001${String(n).padStart(2, '0')}`;

const yakindakiler = async () =>
  (await fetch(`${API}/ilanlar/yakin?enlem=41.0390&boylam=28.8567`)).json();

const ilan = (await yakindakiler()).find((i) => i.urun_adi === ILAN_ADI);
if (!ilan) {
  console.error(`"${ILAN_ADI}" bulunamadı (stok bitmiş olabilir). Önce: npm run seed`);
  process.exit(1);
}
console.log(`İlan: ${ilan.urun_adi}, başlangıç stoğu: ${ilan.kalan_adet}`);
console.log('10 alıcı aynı anda istek gönderiyor...\n');

const sonuclar = await Promise.all(
  Array.from({ length: 10 }, async (_, i) => {
    const yanit = await fetch(`${API}/rezervasyonlar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-kullanici-id': aliciId(i + 1) },
      body: JSON.stringify({ ilan_id: ilan.id, adet: 1 }),
    });
    const govde = await yanit.json();
    return { alici: i + 1, durum: yanit.status, mesaj: govde.message ?? `QR ${govde.qr_kodu}` };
  }),
);

for (const s of sonuclar) {
  console.log(`  Alıcı ${String(s.alici).padStart(2)}  ${s.durum}  ${s.mesaj}`);
}
const basarili = sonuclar.filter((s) => s.durum === 201).length;
const kalan = (await yakindakiler()).find((i) => i.id === ilan.id)?.kalan_adet ?? 0;
console.log(`\nBaşarılı: ${basarili}, reddedilen: ${10 - basarili}, kalan stok: ${kalan}`);
console.log(basarili === ilan.kalan_adet && kalan === 0 ? '✔ Stok eksiye düşmedi' : '✘ BEKLENMEYEN SONUÇ');
