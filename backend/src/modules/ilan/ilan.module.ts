import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ilan } from './ilan.entity';
import { IlanController } from './ilan.controller';
import { IlanService } from './ilan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ilan])],
  controllers: [IlanController],
  providers: [IlanService],
  exports: [TypeOrmModule, IlanService],
})
export class IlanModule {}
