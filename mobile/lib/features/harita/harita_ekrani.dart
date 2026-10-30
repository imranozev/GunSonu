import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';

import '../../core/tema.dart';
import '../../data/ornek_veri.dart';
import '../../models/ilan.dart';
import '../ilan/ilan_detay_ekrani.dart';
import '../ilan/widgets/ilan_karti.dart';

class HaritaEkrani extends StatefulWidget {
  const HaritaEkrani({super.key});

  @override
  State<HaritaEkrani> createState() => _HaritaEkraniState();
}

class _HaritaEkraniState extends State<HaritaEkrani> {
  // TODO: konum izni + geolocator ile gerçek kullanıcı konumu
  final _benimKonumum = varsayilanKonum;
  late final List<Ilan> _ilanlar = ornekIlanlar()
    ..sort((a, b) => a.mesafeMetre.compareTo(b.mesafeMetre));

  void _detayaGit(Ilan ilan) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => IlanDetayEkrani(ilan: ilan)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yakınımdaki ürünler')),
      body: Column(
        children: [
          Expanded(
            flex: 5,
            child: FlutterMap(
              options: MapOptions(initialCenter: _benimKonumum, initialZoom: 15),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.gunsonu.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _benimKonumum,
                      width: 22,
                      height: 22,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                      ),
                    ),
                    for (final ilan in _ilanlar)
                      Marker(
                        point: ilan.konum,
                        width: 40,
                        height: 40,
                        alignment: Alignment.topCenter,
                        child: GestureDetector(
                          onTap: () => _detayaGit(ilan),
                          child: const Icon(Icons.location_on,
                              color: Renkler.turuncu, size: 40),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            flex: 4,
            child: ListView.separated(
              itemCount: _ilanlar.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) => IlanKarti(
                ilan: _ilanlar[i],
                onTap: () => _detayaGit(_ilanlar[i]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
