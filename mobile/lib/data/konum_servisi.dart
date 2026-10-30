import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class KonumServisi {
  /// Kullanıcının konumu; servis kapalıysa, izin yoksa veya zaman aşımında null.
  static Future<LatLng?> mevcutKonum() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return null;

      var izin = await Geolocator.checkPermission();
      if (izin == LocationPermission.denied) {
        izin = await Geolocator.requestPermission();
      }
      if (izin == LocationPermission.denied ||
          izin == LocationPermission.deniedForever) {
        return null;
      }

      final p = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return LatLng(p.latitude, p.longitude);
    } catch (_) {
      return null;
    }
  }
}
