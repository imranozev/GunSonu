import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rezervasyon } from '../rezervasyon/rezervasyon.entity';

@Entity('degerlendirme')
@Check(`"puan" BETWEEN 1 AND 5`)
export class Degerlendirme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  rezervasyon_id: string;

  @OneToOne(() => Rezervasyon, (rezervasyon) => rezervasyon.degerlendirme, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rezervasyon_id' })
  rezervasyon: Rezervasyon;

  @Column({ type: 'smallint' })
  puan: number;

  @Column({ type: 'text', nullable: true })
  yorum: string | null;

  @Column({ default: false })
  sikayet_mi: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  olusturulma_zamani: Date;
}
