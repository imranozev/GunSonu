import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rezervasyon } from './rezervasyon.entity';
import { RezervasyonController } from './rezervasyon.controller';
import { RezervasyonService } from './rezervasyon.service';
import { RezervasyonSuresiService } from './rezervasyon-suresi.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rezervasyon])],
  controllers: [RezervasyonController],
  providers: [RezervasyonService, RezervasyonSuresiService],
  exports: [TypeOrmModule, RezervasyonService],
})
export class RezervasyonModule {}
