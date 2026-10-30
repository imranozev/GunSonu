import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kullanici } from './kullanici.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kullanici])],
  exports: [TypeOrmModule],
})
export class KullaniciModule {}
