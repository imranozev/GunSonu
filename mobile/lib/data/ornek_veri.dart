import 'package:latlong2/latlong.dart';

import '../models/ilan.dart';

// Backend hazır olana kadar ekranları besleyen örnek veri (Bağcılar civarı).
// TODO: GET /api/ilanlar/yakin?enlem=..&boylam=.. ile değiştirilecek.
const varsayilanKonum = LatLng(41.0390, 28.8567);

List<Ilan> ornekIlanlar() {
  final bugun = DateTime.now();
  DateTime saat(int s, int d) => DateTime(bugun.year, bugun.month, bugun.day, s, d);

  return [
    Ilan(
      id: '1',
      urunAdi: 'Günlük Ekmek',
      kategori: 'unlu_mamul',
      isletmeAdi: 'Yener Fırını',
      adres: 'Bağcılar',
      konum: const LatLng(41.0412, 28.8590),
      mesafeMetre: 350,
      kalanAdet: 12,
      kisiBasiLimit: 3,
      sonTuketimTarihi: bugun,
      teslimBaslangic: saat(19, 0),
      teslimBitis: saat(20, 30),
    ),
    Ilan(
      id: '2',
      urunAdi: 'Poğaça',
      kategori: 'unlu_mamul',
      isletmeAdi: 'Mahalle Pastanesi',
      adres: 'Bağcılar',
      konum: const LatLng(41.0355, 28.8520),
      mesafeMetre: 600,
      kalanAdet: 8,
      kisiBasiLimit: 2,
      sonTuketimTarihi: bugun,
      teslimBaslangic: saat(19, 30),
      teslimBitis: saat(21, 0),
    ),
    Ilan(
      id: '3',
      urunAdi: 'Yoğurt',
      kategori: 'sut_urunu',
      isletmeAdi: 'Köşe Market',
      adres: 'Bağcılar',
      konum: const LatLng(41.0445, 28.8635),
      mesafeMetre: 900,
      kalanAdet: 5,
      kisiBasiLimit: 1,
      sonTuketimTarihi: bugun,
      teslimBaslangic: saat(20, 0),
      teslimBitis: saat(21, 30),
    ),
  ];
}
