import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Isletme } from './isletme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Isletme])],
  exports: [TypeOrmModule],
})
export class IsletmeModule {}
