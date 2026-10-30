import 'package:flutter/material.dart';

// TODO: aktif rezervasyon + QR kod (qr_flutter) + kalan süre sayacı
class RezervasyonlarimEkrani extends StatelessWidget {
  const RezervasyonlarimEkrani({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rezervasyonlarım')),
      body: const Center(child: Text('Henüz aktif rezervasyonun yok.')),
    );
  }
}
