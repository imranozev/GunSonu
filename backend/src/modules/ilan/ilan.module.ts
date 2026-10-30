import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ilan } from './ilan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ilan])],
  exports: [TypeOrmModule],
})
export class IlanModule {}
