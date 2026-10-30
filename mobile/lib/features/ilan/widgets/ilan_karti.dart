import 'package:flutter/material.dart';

import '../../../core/tema.dart';
import '../../../models/ilan.dart';

class IlanKarti extends StatelessWidget {
  final Ilan ilan;
  final VoidCallback onTap;

  const IlanKarti({super.key, required this.ilan, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      leading: Container(
        width: 48,
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Renkler.turuncuAcik,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(ilan.kategoriEmoji, style: const TextStyle(fontSize: 24)),
      ),
      title: Text(ilan.isletmeAdi,
          style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text(
          '${ilan.kalanAdet} ${ilan.urunAdi.toLowerCase()} · ${ilan.mesafeMetni}'),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: Renkler.yesilAcik,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          "${saatMetni(ilan.teslimBitis)}'a kadar",
          style: const TextStyle(
              color: Renkler.yesil, fontWeight: FontWeight.w600, fontSize: 12),
        ),
      ),
    );
  }
}
