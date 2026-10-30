import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

import '../core/ayarlar.dart';
import '../models/ilan.dart';

class ApiHatasi implements Exception {
  final String mesaj;
  const ApiHatasi(this.mesaj);

  @override
  String toString() => mesaj;
}

class IlanApi {
  final http.Client _istemci;
  final String _tabanUrl;

  IlanApi({http.Client? istemci, String? tabanUrl})
      : _istemci = istemci ?? http.Client(),
        _tabanUrl = tabanUrl ?? apiTabanUrl;

  /// GET /ilanlar/yakin — sunucu mesafeye göre sıralı döner.
  Future<List<Ilan>> yakindakiler(LatLng merkez, {int yaricapMetre = 3000}) async {
    final uri = Uri.parse('$_tabanUrl/ilanlar/yakin').replace(queryParameters: {
      'enlem': merkez.latitude.toString(),
      'boylam': merkez.longitude.toString(),
      'yaricap': yaricapMetre.toString(),
    });

    final http.Response yanit;
    try {
      yanit = await _istemci.get(uri).timeout(const Duration(seconds: 8));
    } catch (_) {
      throw const ApiHatasi('Sunucuya ulaşılamadı');
    }
    if (yanit.statusCode != 200) {
      throw ApiHatasi('Sunucu hatası (${yanit.statusCode})');
    }

    final liste = jsonDecode(utf8.decode(yanit.bodyBytes)) as List;
    return liste.map((e) => Ilan.fromJson(e as Map<String, dynamic>)).toList();
  }
}
