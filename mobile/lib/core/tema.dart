import 'package:flutter/material.dart';

/// Sunumdaki renk paleti
class Renkler {
  static const yesil = Color(0xFF1E5C45);
  static const yesilAcik = Color(0xFFDCEBDF);
  static const turuncu = Color(0xFFD9822B);
  static const turuncuAcik = Color(0xFFFBE6D0);
  static const krem = Color(0xFFFAF6EF);
  static const metin = Color(0xFF1F2A24);
  static const metinSoluk = Color(0xFF6B756F);
}

final gunSonuTema = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Renkler.yesil,
    primary: Renkler.yesil,
    secondary: Renkler.turuncu,
    surface: Colors.white,
  ),
  scaffoldBackgroundColor: Colors.white,
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    foregroundColor: Renkler.yesil,
    elevation: 0,
    titleTextStyle: TextStyle(
      color: Renkler.yesil,
      fontSize: 20,
      fontWeight: FontWeight.w700,
    ),
  ),
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      backgroundColor: Renkler.yesil,
      minimumSize: const Size.fromHeight(52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
  ),
);
