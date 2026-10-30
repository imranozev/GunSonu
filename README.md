# GünSonu

Market ve fırınların gün sonunda kalan, tüketimi güvenli ürünlerini konum tabanlı bir mobil uygulamayla ihtiyaç sahiplerine ulaştıran platform.

**Ekip:** Elif Selay Yener (mobil, arayüz) · İmran Özev (sunucu, veritabanı, yönetim paneli)

## Klasör yapısı

```
GunSonu/
├── docker-compose.yml        PostgreSQL + PostGIS, Redis
├── backend/                  NestJS + TypeORM
│   └── src/
│       ├── common/enums.ts   rol, kategori, durum enum'ları
│       └── modules/
│           ├── kullanici/    Kullanici entity + modül
│           ├── isletme/      Isletme (konum: geography Point, GiST indeks)
│           ├── ilan/         Ilan (stok CHECK kısıtları)
│           ├── rezervasyon/  Rezervasyon (ilan+kullanıcı benzersiz)
│           └── degerlendirme/ Degerlendirme (rezervasyona 1:1)
└── mobile/                   Flutter
    └── lib/
        ├── core/tema.dart    renk paleti ve tema
        ├── models/ilan.dart
        ├── data/ornek_veri.dart   API hazır olana kadar örnek veri
        └── features/
            ├── harita/       harita + yakın ilanlar listesi
            ├── ilan/         ilan detayı ve rezervasyon
            ├── rezervasyon/  (iskelet) QR ile teslim
            └── profil/       (iskelet)
```

## Çalıştırma

### Veritabanı ve Redis
```bash
docker compose up -d
```
`postgis/postgis` imajı PostGIS eklentisini `gunsonu` veritabanında otomatik açar.

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev      # http://localhost:3000/api
```
Geliştirmede `DB_SYNC=true` ile tablolar entity'lerden oluşturulur. Pilot öncesi migration'a geçilecek.

Örnek veri (Bağcılar'da 3 işletme + filtre testleri için uzak/onaysız/süresi geçmiş/tükenmiş ilanlar):
```bash
npm run seed           # DİKKAT: tüm tabloları boşaltır
```

**Yakındaki ilanlar**
```
GET /api/ilanlar/yakin?enlem=41.0390&boylam=28.8567&yaricap=3000
```
`yaricap` metre cinsinden (100–10000, varsayılan 3000). Yalnızca onaylı işletmelerin, stoğu olan, teslim süresi ve son tüketim tarihi geçmemiş ilanları mesafeye göre sıralı döner (en fazla 50). Sorgu `ST_DWithin` ile `isletme.konum` GiST indeksini kullanır.

### Mobil
```bash
cd mobile
flutter create . --org com.gunsonu --platforms=android,ios   # android/ ve ios/ klasörlerini üretir
flutter pub get
flutter run
```
Harita OpenStreetMap (`flutter_map`) ile çalışır, API anahtarı gerekmez.

API adresi varsayılan olarak Android emülatöründe `http://10.0.2.2:3000/api`, iOS simülatöründe `http://localhost:3000/api`. Gerçek cihazda bilgisayarın yerel IP'sini verin:
```bash
flutter run --dart-define=API_URL=http://192.168.1.20:3000/api
```
Debug modda sunucuya ulaşılamazsa örnek veri gösterilir.

`flutter create` sonrası eklenmesi gereken platform ayarları:
- **Android** `android/app/src/main/AndroidManifest.xml`: `<uses-permission android:name="android.permission.INTERNET"/>`, `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>`, `<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>`; geliştirmede HTTP için `<application android:usesCleartextTraffic="true" ...>`
- **iOS** `ios/Runner/Info.plist`: `NSLocationWhenInUseUsageDescription` (ör. "Yakınındaki ürünleri göstermek için konumunu kullanıyoruz."); geliştirmede HTTP için `NSAppTransportSecurity` → `NSAllowsLocalNetworking = true`

## Sonraki adımlar
- [x] Backend: yakın ilan sorgusu (`ST_DWithin`)
- [ ] Backend: ilan oluşturma, rezervasyon, atomik stok düşürme, Redis TTL ile rezervasyon süresi
- [ ] Backend: kural motoru (geçmiş tarih ve kategori kontrolü), JWT + SMS doğrulama
- [x] Mobil: gerçek konum (geolocator), harita ↔ API bağlantısı, "bu bölgede ara"
- [ ] Mobil: rezervasyon isteği, QR ekranı, işletme ilan ekranı
- [ ] API sözleşmesi
