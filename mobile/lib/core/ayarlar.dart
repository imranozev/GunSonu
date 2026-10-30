import 'dart:io';

/// API adresi: `flutter run --dart-define=API_URL=http://192.168.1.20:3000/api`
/// Verilmezse emülatör/simülatör için yerel makine kullanılır
/// (Android emülatöründe bilgisayarın localhost'u 10.0.2.2'dir).
final String apiTabanUrl = const String.fromEnvironment('API_URL').isNotEmpty
    ? const String.fromEnvironment('API_URL')
    : Platform.isAndroid
        ? 'http://10.0.2.2:3000/api'
        : 'http://localhost:3000/api';
