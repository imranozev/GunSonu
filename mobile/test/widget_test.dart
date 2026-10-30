import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gunsonu/data/ornek_veri.dart';
import 'package:gunsonu/features/ilan/ilan_detay_ekrani.dart';

void main() {
  testWidgets('Adet kişi başı limiti aşamaz', (tester) async {
    final ilan = ornekIlanlar().first; // kisiBasiLimit: 3
    await tester.pumpWidget(MaterialApp(home: IlanDetayEkrani(ilan: ilan)));

    for (var i = 0; i < 5; i++) {
      await tester.tap(find.byIcon(Icons.add));
      await tester.pump();
    }
    expect(find.text('3'), findsOneWidget);
  });
}
