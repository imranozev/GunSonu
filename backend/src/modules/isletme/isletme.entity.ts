import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Point } from 'geojson';
import { IsletmeTuru } from '../../common/enums';
import { Kullanici } from '../kullanici/kullanici.entity';
import { Ilan } from '../ilan/ilan.entity';

@Entity('isletme')
export class Isletme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sahip_id: string;

  @ManyToOne(() => Kullanici, (kullanici) => kullanici.isletmeler, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sahip_id' })
  sahip: Kullanici;

  @Column({ length: 120 })
  ad: string;

  @Column({ type: 'enum', enum: IsletmeTuru })
  tur: IsletmeTuru;

  // GiST indeksi: ST_DWithin / ST_Distance ile "bana en yakın" sorgusu
  @Index({ spatial: true })
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
  konum: Point;

  @Column({ type: 'text' })
  adres: string;

  @Column({ type: 'time' })
  kapanis_saati: string;

  @Column({ default: false })
  onayli_mi: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  olusturulma_zamani: Date;

  @OneToMany(() => Ilan, (ilan) => ilan.isletme)
  ilanlar: Ilan[];
}
