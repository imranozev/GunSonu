import 'package:flutter/material.dart';

import '../../core/tema.dart';
import '../../models/ilan.dart';

class IlanDetayEkrani extends StatefulWidget {
  final Ilan ilan;

  const IlanDetayEkrani({super.key, required this.ilan});

  @override
  State<IlanDetayEkrani> createState() => _IlanDetayEkraniState();
}

class _IlanDetayEkraniState extends State<IlanDetayEkrani> {
  int _adet = 1;

  int get _ustSinir => widget.ilan.kisiBasiLimit < widget.ilan.kalanAdet
      ? widget.ilan.kisiBasiLimit
      : widget.ilan.kalanAdet;

  void _ayirt() {
    // TODO: POST /api/rezervasyonlar { ilan_id, adet } → QR ekranına geç
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$_adet adet ayırtıldı (örnek). 60 dk içinde teslim alın.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ilan = widget.ilan;
    return Scaffold(
      appBar: AppBar(),
      body: ListView(
        children: [
          Container(
            height: 180,
            color: Renkler.turuncuAcik,
            alignment: Alignment.center,
            child: Text(ilan.kategoriEmoji, style: const TextStyle(fontSize: 80)),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(ilan.urunAdi,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text('${ilan.isletmeAdi} · ${ilan.mesafeMetni} · ${ilan.adres}',
                    style: const TextStyle(color: Renkler.metinSoluk)),
                const SizedBox(height: 12),
                Wrap(spacing: 8, children: [
                  _Etiket('${ilan.kalanAdet} adet kaldı',
                      Renkler.turuncuAcik, Renkler.turuncu),
                ]),
                const SizedBox(height: 16),
                _Satir('Teslim saati',
                    '${saatMetni(ilan.teslimBaslangic)} – ${saatMetni(ilan.teslimBitis)}'),
                _Satir('Kişi başı en fazla', '${ilan.kisiBasiLimit} adet'),
                _Satir('Son tüketim', tarihMetni(ilan.sonTuketimTarihi)),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE5E1D8)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Text('Adet',
                          style: TextStyle(color: Renkler.metinSoluk)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: _adet > 1 ? () => setState(() => _adet--) : null,
                      ),
                      Text('$_adet',
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w700)),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed:
                            _adet < _ustSinir ? () => setState(() => _adet++) : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: ilan.kalanAdet > 0 ? _ayirt : null,
                  child: const Text('Ayırt (60 dk)',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Etiket extends StatelessWidget {
  final String metin;
  final Color arkaPlan;
  final Color renk;

  const _Etiket(this.metin, this.arkaPlan, this.renk);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
          color: arkaPlan, borderRadius: BorderRadius.circular(20)),
      child: Text(metin,
          style: TextStyle(
              color: renk, fontWeight: FontWeight.w600, fontSize: 12)),
    );
  }
}

class _Satir extends StatelessWidget {
  final String baslik;
  final String deger;

  const _Satir(this.baslik, this.deger);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Text.rich(TextSpan(children: [
        TextSpan(
            text: '$baslik: ',
            style: const TextStyle(fontWeight: FontWeight.w700)),
        TextSpan(text: deger),
      ])),
    );
  }
}
