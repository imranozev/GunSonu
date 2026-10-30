import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IlanKategori } from '../../common/enums';
import { Isletme } from '../isletme/isletme.entity';
import { Rezervasyon } from '../rezervasyon/rezervasyon.entity';

@Entity('ilan')
// Atomik stok düşürmede (kalan_adet >= :adet) ek güvence
@Check(`"kalan_adet" >= 0 AND "kalan_adet" <= "toplam_adet"`)
@Check(`"kisi_basi_limit" > 0`)
@Check(`"teslim_baslangic" < "teslim_bitis"`)
export class Ilan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  isletme_id: string;

  @ManyToOne(() => Isletme, (isletme) => isletme.ilanlar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'isletme_id' })
  isletme: Isletme;

  @Column({ length: 120 })
  urun_adi: string;

  @Column({ type: 'enum', enum: IlanKategori })
  kategori: IlanKategori;

  @Column({ type: 'int' })
  toplam_adet: number;

  @Column({ type: 'int' })
  kalan_adet: number;

  @Column({ type: 'int' })
  kisi_basi_limit: number;

  // Geçmiş tarih kontrolü kural motorunda yapılır (servis katmanı)
  @Column({ type: 'date' })
  son_tuketim_tarihi: string;

  @Column({ type: 'timestamptz' })
  teslim_baslangic: Date;

  @Index()
  @Column({ type: 'timestamptz' })
  teslim_bitis: Date;

  @Column({ type: 'text', nullable: true })
  foto_url: string | null;

  // İşletmenin "ürün tüketime uygundur" beyanı
  @Column({ default: false })
  uygunluk_beyani: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  olusturulma_zamani: Date;

  @OneToMany(() => Rezervasyon, (rezervasyon) => rezervasyon.ilan)
  rezervasyonlar: Rezervasyon[];
}
