import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rezervasyon } from './rezervasyon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rezervasyon])],
  exports: [TypeOrmModule],
})
export class RezervasyonModule {}
