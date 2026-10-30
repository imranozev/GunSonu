import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { IlanService } from './ilan.service';
import { YakinIlan } from './yakin-ilan';

const EN_KUCUK_YARICAP = 100;
const EN_BUYUK_YARICAP = 10_000;

@Controller('ilanlar')
export class IlanController {
  constructor(private readonly ilanService: IlanService) {}

  // GET /api/ilanlar/yakin?enlem=41.039&boylam=28.856&yaricap=3000
  @Get('yakin')
  yakindakiler(
    @Query('enlem', ParseFloatPipe) enlem: number,
    @Query('boylam', ParseFloatPipe) boylam: number,
    @Query('yaricap', new DefaultValuePipe(3000), ParseIntPipe) yaricap: number,
  ): Promise<YakinIlan[]> {
    if (enlem < -90 || enlem > 90 || boylam < -180 || boylam > 180) {
      throw new BadRequestException('Geçersiz koordinat');
    }
    if (yaricap < EN_KUCUK_YARICAP || yaricap > EN_BUYUK_YARICAP) {
      throw new BadRequestException(
        `yaricap ${EN_KUCUK_YARICAP}-${EN_BUYUK_YARICAP} metre arasında olmalı`,
      );
    }
    return this.ilanService.yakindakiIlanlar(enlem, boylam, yaricap);
  }
}
