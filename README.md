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

### Mobil
```bash
cd mobile
flutter create . --org com.gunsonu --platforms=android,ios   # android/ ve ios/ klasörlerini üretir
flutter pub get
flutter run
```
Harita OpenStreetMap (`flutter_map`) ile çalışır, API anahtarı gerekmez.

## Sonraki adımlar
- [ ] Backend: servis/controller'lar, yakın ilan sorgusu (`ST_DWithin`), atomik stok düşürme, Redis TTL ile rezervasyon süresi
- [ ] Backend: kural motoru (geçmiş tarih ve kategori kontrolü), JWT + SMS doğrulama
- [ ] Mobil: gerçek konum (geolocator), API bağlantısı, QR ekranı, işletme ilan ekranı
- [ ] API sözleşmesi
