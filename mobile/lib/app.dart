import 'package:flutter/material.dart';

import 'core/tema.dart';
import 'features/harita/harita_ekrani.dart';
import 'features/profil/profil_ekrani.dart';
import 'features/rezervasyon/rezervasyonlarim_ekrani.dart';

class GunSonuApp extends StatelessWidget {
  const GunSonuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GünSonu',
      debugShowCheckedModeBanner: false,
      theme: gunSonuTema,
      home: const AnaKabuk(),
    );
  }
}

/// Alt gezinme çubuğu: Harita · Rezervasyonlarım · Profil
class AnaKabuk extends StatefulWidget {
  const AnaKabuk({super.key});

  @override
  State<AnaKabuk> createState() => _AnaKabukState();
}

class _AnaKabukState extends State<AnaKabuk> {
  int _secili = 0;

  static const _ekranlar = [
    HaritaEkrani(),
    RezervasyonlarimEkrani(),
    ProfilEkrani(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _secili, children: _ekranlar),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _secili,
        onDestinationSelected: (i) => setState(() => _secili = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Harita'),
          NavigationDestination(
              icon: Icon(Icons.qr_code_2), label: 'Rezervasyonlarım'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
    );
  }
}
