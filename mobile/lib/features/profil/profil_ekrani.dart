import 'package:flutter/material.dart';

// TODO: SMS ile giriş, ihtiyaç sahibi başvuru durumu
class ProfilEkrani extends StatelessWidget {
  const ProfilEkrani({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: const Center(child: Text('Giriş yapılmadı.')),
    );
  }
}
