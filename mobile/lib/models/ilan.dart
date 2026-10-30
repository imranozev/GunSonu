import 'package:latlong2/latlong.dart';

/// Backend `ilan` + `isletme` birleşik görünümü (yakındaki ilanlar sorgusu).
class Ilan {
  final String id;
  final String urunAdi;
  final String kategori;
  final String isletmeAdi;
  final String adres;
  final LatLng konum;
  final int mesafeMetre;
  final int kalanAdet;
  final int kisiBasiLimit;
  final DateTime sonTuketimTarihi;
  final DateTime teslimBaslangic;
  final DateTime teslimBitis;

  const Ilan({
    required this.id,
    required this.urunAdi,
    required this.kategori,
    required this.isletmeAdi,
    required this.adres,
    required this.konum,
    required this.mesafeMetre,
    required this.kalanAdet,
    required this.kisiBasiLimit,
    required this.sonTuketimTarihi,
    required this.teslimBaslangic,
    required this.teslimBitis,
  });

  factory Ilan.fromJson(Map<String, dynamic> json) {
    final koordinat = json['konum']['coordinates'] as List; // GeoJSON: [boylam, enlem]
    return Ilan(
      id: json['id'] as String,
      urunAdi: json['urun_adi'] as String,
      kategori: json['kategori'] as String,
      isletmeAdi: json['isletme_adi'] as String,
      adres: json['adres'] as String,
      konum: LatLng(
          (koordinat[1] as num).toDouble(), (koordinat[0] as num).toDouble()),
      mesafeMetre: (json['mesafe'] as num).round(),
      kalanAdet: json['kalan_adet'] as int,
      kisiBasiLimit: json['kisi_basi_limit'] as int,
      sonTuketimTarihi: DateTime.parse(json['son_tuketim_tarihi'] as String),
      teslimBaslangic: DateTime.parse(json['teslim_baslangic'] as String).toLocal(),
      // API zamanları UTC (…Z) döner; saat metinleri yerel saatte gösterilmeli
      teslimBitis: DateTime.parse(json['teslim_bitis'] as String).toLocal(),
    );
  }

  String get mesafeMetni => mesafeMetre < 1000
      ? '$mesafeMetre m'
      : '${(mesafeMetre / 1000).toStringAsFixed(1)} km';

  String get kategoriEmoji => switch (kategori) {
        'unlu_mamul' => '🥖',
        'kuru_pasta' => '🥐',
        'paketli' => '📦',
        'meyve_sebze' => '🍎',
        'sut_urunu' => '🥛',
        _ => '🛒',
      };
}

String saatMetni(DateTime t) =>
    '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

String tarihMetni(DateTime t) =>
    '${t.day.toString().padLeft(2, '0')}.${t.month.toString().padLeft(2, '0')}.${t.year}';
