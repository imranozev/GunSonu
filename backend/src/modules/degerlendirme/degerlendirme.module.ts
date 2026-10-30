import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Degerlendirme } from './degerlendirme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Degerlendirme])],
  exports: [TypeOrmModule],
})
export class DegerlendirmeModule {}
