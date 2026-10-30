import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DogrulamaDurumu, KullaniciRol } from '../../common/enums';
import { Isletme } from '../isletme/isletme.entity';
import { Rezervasyon } from '../rezervasyon/rezervasyon.entity';

@Entity('kullanici')
export class Kullanici {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  ad_soyad: string;

  @Column({ length: 20, unique: true })
  telefon: string;

  @Column({ type: 'enum', enum: KullaniciRol, default: KullaniciRol.ALICI })
  rol: KullaniciRol;

  @Column({
    type: 'enum',
    enum: DogrulamaDurumu,
    default: DogrulamaDurumu.BEKLEMEDE,
  })
  dogrulama_durumu: DogrulamaDurumu;

  // Gelinmeyen rezervasyon sayısı; 3 olunca 7 gün askı
  @Column({ type: 'smallint', default: 0 })
  ihlal_sayisi: number;

  @Column({ type: 'timestamptz', nullable: true })
  askiya_alinma_bitis: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  olusturulma_zamani: Date;

  @OneToMany(() => Isletme, (isletme) => isletme.sahip)
  isletmeler: Isletme[];

  @OneToMany(() => Rezervasyon, (rezervasyon) => rezervasyon.kullanici)
  rezervasyonlar: Rezervasyon[];
}
