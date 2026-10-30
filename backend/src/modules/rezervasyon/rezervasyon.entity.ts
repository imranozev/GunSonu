import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RezervasyonDurumu } from '../../common/enums';
import { Ilan } from '../ilan/ilan.entity';
import { Kullanici } from '../kullanici/kullanici.entity';
import { Degerlendirme } from '../degerlendirme/degerlendirme.entity';

@Entity('rezervasyon')
// Aynı ilana tekrar başvuru engelli
@Unique(['ilan_id', 'kullanici_id'])
@Check(`"adet" > 0`)
export class Rezervasyon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ilan_id: string;

  @ManyToOne(() => Ilan, (ilan) => ilan.rezervasyonlar, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ilan_id' })
  ilan: Ilan;

  @Index()
  @Column({ type: 'uuid' })
  kullanici_id: string;

  @ManyToOne(() => Kullanici, (kullanici) => kullanici.rezervasyonlar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kullanici_id' })
  kullanici: Kullanici;

  @Column({ type: 'int' })
  adet: number;

  @Column({ length: 64, unique: true })
  qr_kodu: string;

  @Column({
    type: 'enum',
    enum: RezervasyonDurumu,
    default: RezervasyonDurumu.BEKLIYOR,
  })
  durum: RezervasyonDurumu;

  @CreateDateColumn({ type: 'timestamptz' })
  olusma_zamani: Date;

  // olusma_zamani + 60 dk (soğuk zincirde ilan teslim_bitis'i ile sınırlı)
  @Column({ type: 'timestamptz' })
  son_gecerlilik: Date;

  @Column({ type: 'timestamptz', nullable: true })
  teslim_zamani: Date | null;

  @OneToOne(() => Degerlendirme, (degerlendirme) => degerlendirme.rezervasyon)
  degerlendirme: Degerlendirme;
}
