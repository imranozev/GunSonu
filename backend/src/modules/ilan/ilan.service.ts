import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ilan } from './ilan.entity';
import { YakinIlan } from './yakin-ilan';

const YAKIN_ILAN_LIMITI = 50;

// $1 boylam, $2 enlem (ST_MakePoint sırası: x=boylam, y=enlem), $3 yarıçap (m), $4 limit.
// ST_DWithin geography üzerinde isletme.konum GiST indeksini kullanır.
const YAKIN_ILANLAR_SQL = `
  WITH ben AS (
    SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS nokta
  )
  SELECT
    i.id,
    i.urun_adi,
    i.kategori,
    i.kalan_adet,
    i.kisi_basi_limit,
    i.son_tuketim_tarihi::text AS son_tuketim_tarihi,
    i.teslim_baslangic,
    i.teslim_bitis,
    s.id AS isletme_id,
    s.ad AS isletme_adi,
    s.adres,
    ST_AsGeoJSON(s.konum)::json AS konum,
    ROUND(ST_Distance(s.konum, ben.nokta))::int AS mesafe
  FROM ilan i
  JOIN isletme s ON s.id = i.isletme_id
  CROSS JOIN ben
  WHERE s.onayli_mi
    AND ST_DWithin(s.konum, ben.nokta, $3)
    AND i.kalan_adet > 0
    AND now() < i.teslim_bitis
    AND i.son_tuketim_tarihi >= CURRENT_DATE
  ORDER BY mesafe
  LIMIT $4
`;

@Injectable()
export class IlanService {
  constructor(
    @InjectRepository(Ilan) private readonly ilanRepo: Repository<Ilan>,
  ) {}

  yakindakiIlanlar(
    enlem: number,
    boylam: number,
    yaricapMetre: number,
  ): Promise<YakinIlan[]> {
    return this.ilanRepo.query(YAKIN_ILANLAR_SQL, [
      boylam,
      enlem,
      yaricapMetre,
      YAKIN_ILAN_LIMITI,
    ]);
  }
}
