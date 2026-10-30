import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../core/tema.dart';
import '../../data/ilan_api.dart';
import '../../data/konum_servisi.dart';
import '../../data/ornek_veri.dart';
import '../../models/ilan.dart';
import '../ilan/ilan_detay_ekrani.dart';
import '../ilan/widgets/ilan_karti.dart';

class HaritaEkrani extends StatefulWidget {
  final IlanApi? api;

  const HaritaEkrani({super.key, this.api});

  @override
  State<HaritaEkrani> createState() => _HaritaEkraniState();
}

class _HaritaEkraniState extends State<HaritaEkrani> {
  static const _yaricapMetre = 3000;
  static const _yakinlik = 15.0;

  late final IlanApi _api = widget.api ?? IlanApi();
  final _harita = MapController();
  bool _haritaHazir = false;

  LatLng _benimKonumum = varsayilanKonum;
  LatLng _aramaMerkezi = varsayilanKonum;
  LatLng _haritaMerkezi = varsayilanKonum;
  List<Ilan> _ilanlar = const [];
  bool _yukleniyor = true;
  bool _bolgeDegisti = false;
  String? _konumUyarisi;
  String? _sunucuUyarisi;

  @override
  void initState() {
    super.initState();
    _baslat();
  }

  Future<void> _baslat() async {
    final konum = await KonumServisi.mevcutKonum();
    if (!mounted) return;
    setState(() {
      if (konum != null) _benimKonumum = konum;
      _konumUyarisi =
          konum == null ? 'Konum alınamadı, varsayılan bölge gösteriliyor.' : null;
      _aramaMerkezi = _benimKonumum;
    });
    if (_haritaHazir) _harita.move(_benimKonumum, _yakinlik);
    await _ilanlariGetir();
  }

  Future<void> _ilanlariGetir() async {
    setState(() {
      _yukleniyor = true;
      _bolgeDegisti = false;
    });
    try {
      final ilanlar =
          await _api.yakindakiler(_aramaMerkezi, yaricapMetre: _yaricapMetre);
      if (!mounted) return;
      setState(() {
        _ilanlar = ilanlar;
        _sunucuUyarisi = null;
      });
    } on ApiHatasi catch (hata) {
      if (!mounted) return;
      setState(() {
        _ilanlar = kDebugMode ? ornekIlanlar() : const [];
        _sunucuUyarisi =
            kDebugMode ? '$hata. Örnek veri gösteriliyor.' : hata.toString();
      });
    } finally {
      if (mounted) setState(() => _yukleniyor = false);
    }
  }

  void _buBolgedeAra() {
    _aramaMerkezi = _haritaMerkezi;
    _ilanlariGetir();
  }

  void _konumumaDon() {
    _harita.move(_benimKonumum, _yakinlik);
    if (_aramaMerkezi != _benimKonumum) {
      _aramaMerkezi = _benimKonumum;
      _ilanlariGetir();
    }
  }

  void _detayaGit(Ilan ilan) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => IlanDetayEkrani(ilan: ilan)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final uyari = _sunucuUyarisi ?? _konumUyarisi;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yakınımdaki ürünler'),
        actions: [
          IconButton(
            tooltip: 'Yenile',
            icon: const Icon(Icons.refresh),
            onPressed: _yukleniyor ? null : _ilanlariGetir,
          ),
        ],
      ),
      body: Column(
        children: [
          if (uyari != null) _UyariBandi(uyari),
          Expanded(flex: 5, child: _haritaKatmani()),
          if (_yukleniyor) const LinearProgressIndicator(minHeight: 2),
          Expanded(flex: 4, child: _liste()),
        ],
      ),
    );
  }

  Widget _haritaKatmani() {
    return Stack(
      children: [
        FlutterMap(
          mapController: _harita,
          options: MapOptions(
            initialCenter: _benimKonumum,
            initialZoom: _yakinlik,
            onMapReady: () {
              _haritaHazir = true;
              _harita.move(_benimKonumum, _yakinlik);
            },
            onPositionChanged: (kamera, kullaniciHareketi) {
              _haritaMerkezi = kamera.center;
              if (!kullaniciHareketi || _bolgeDegisti) return;
              final kayma = const Distance().as(
                  LengthUnit.Meter, _aramaMerkezi, kamera.center);
              if (kayma > _yaricapMetre / 3) {
                setState(() => _bolgeDegisti = true);
              }
            },
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.gunsonu.app',
            ),
            CircleLayer(circles: [
              CircleMarker(
                point: _aramaMerkezi,
                radius: _yaricapMetre.toDouble(),
                useRadiusInMeter: true,
                color: const Color(0x141E5C45),
                borderColor: const Color(0x551E5C45),
                borderStrokeWidth: 1,
              ),
            ]),
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
            const RichAttributionWidget(
              attributions: [TextSourceAttribution('OpenStreetMap katkıcıları')],
            ),
          ],
        ),
        if (_bolgeDegisti)
          Positioned(
            top: 12,
            left: 0,
            right: 0,
            child: Center(
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, 40),
                  shape: const StadiumBorder(),
                ),
                onPressed: _yukleniyor ? null : _buBolgedeAra,
                icon: const Icon(Icons.search, size: 18),
                label: const Text('Bu bölgede ara'),
              ),
            ),
          ),
        Positioned(
          right: 12,
          bottom: 12,
          child: FloatingActionButton.small(
            heroTag: 'konumum',
            tooltip: 'Konumuma dön',
            backgroundColor: Colors.white,
            foregroundColor: Renkler.yesil,
            onPressed: _konumumaDon,
            child: const Icon(Icons.my_location),
          ),
        ),
      ],
    );
  }

  Widget _liste() {
    if (!_yukleniyor && _ilanlar.isEmpty) {
      return RefreshIndicator(
        onRefresh: _ilanlariGetir,
        child: ListView(
          children: const [
            Padding(
              padding: EdgeInsets.all(32),
              child: Text(
                'Şu an 3 km içinde paylaşılan ürün yok.\nYeni ilanlar bildirimle duyurulacak.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Renkler.metinSoluk),
              ),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _ilanlariGetir,
      child: ListView.separated(
        itemCount: _ilanlar.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (_, i) => IlanKarti(
          ilan: _ilanlar[i],
          onTap: () => _detayaGit(_ilanlar[i]),
        ),
      ),
    );
  }
}

class _UyariBandi extends StatelessWidget {
  final String metin;

  const _UyariBandi(this.metin);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Renkler.turuncuAcik,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(metin,
          style: const TextStyle(color: Renkler.metin, fontSize: 13)),
    );
  }
}
