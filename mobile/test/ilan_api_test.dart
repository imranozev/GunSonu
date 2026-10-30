import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:gunsonu/data/ilan_api.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:latlong2/latlong.dart';

// Backend'in gerçek yanıtından alınmış örnek satır
const _ornekYanit = [
  {
    'id': 'a1',
    'urun_adi': 'Günlük Ekmek',
    'kategori': 'unlu_mamul',
    'kalan_adet': 12,
    'kisi_basi_limit': 3,
    'son_tuketim_tarihi': '2026-10-30',
    'teslim_baslangic': '2026-10-30T16:00:00.000Z',
    'teslim_bitis': '2026-10-30T17:30:00.000Z',
    'isletme_id': 'b1',
    'isletme_adi': 'Yener Fırını',
    'adres': 'Bağcılar',
    'konum': {
      'type': 'Point',
      'coordinates': [28.859, 41.0412],
    },
    'mesafe': 312,
  },
];

void main() {
  test('yakındaki ilanlar doğru sorgulanır ve çözülür', () async {
    late Uri istek;
    final api = IlanApi(
      tabanUrl: 'http://test/api',
      istemci: MockClient((req) async {
        istek = req.url;
        return http.Response.bytes(utf8.encode(jsonEncode(_ornekYanit)), 200);
      }),
    );

    final ilanlar = await api.yakindakiler(const LatLng(41.039, 28.8567));

    expect(istek.path, '/api/ilanlar/yakin');
    expect(istek.queryParameters,
        {'enlem': '41.039', 'boylam': '28.8567', 'yaricap': '3000'});
    final ilan = ilanlar.single;
    expect(ilan.isletmeAdi, 'Yener Fırını');
    expect(ilan.konum, const LatLng(41.0412, 28.859)); // GeoJSON [boylam, enlem]
    expect(ilan.mesafeMetni, '312 m');
    expect(ilan.teslimBitis.isUtc, isFalse);
  });

  test('sunucu hatası ApiHatasi fırlatır', () async {
    final api = IlanApi(
      tabanUrl: 'http://test/api',
      istemci: MockClient((_) async => http.Response('', 500)),
    );
    expect(api.yakindakiler(const LatLng(0, 0)), throwsA(isA<ApiHatasi>()));
  });
}
