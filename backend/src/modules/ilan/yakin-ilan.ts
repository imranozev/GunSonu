import type { Point } from 'geojson';
import { IlanKategori } from '../../common/enums';

/** GET /ilanlar/yakin yanıtındaki tek satır (ilan + işletme + mesafe). */
export interface YakinIlan {
  id: string;
  urun_adi: string;
  kategori: IlanKategori;
  kalan_adet: number;
  kisi_basi_limit: number;
  son_tuketim_tarihi: string; // YYYY-MM-DD
  teslim_baslangic: Date;
  teslim_bitis: Date;
  isletme_id: string;
  isletme_adi: string;
  adres: string;
  konum: Point;
  mesafe: number; // metre
}
