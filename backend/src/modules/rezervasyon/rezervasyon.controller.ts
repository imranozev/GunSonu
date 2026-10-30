import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { KullaniciId } from '../../common/kullanici-id.decorator';
import { RezervasyonService } from './rezervasyon.service';

@Controller('rezervasyonlar')
export class RezervasyonController {
  constructor(private readonly rezervasyonService: RezervasyonService) {}

  // POST /api/rezervasyonlar { "ilan_id": "...", "adet": 2 }
  @Post()
  async olustur(
    @KullaniciId() kullaniciId: string,
    @Body('ilan_id', ParseUUIDPipe) ilanId: string,
    @Body('adet', ParseIntPipe) adet: number,
  ) {
    const r = await this.rezervasyonService.olustur(kullaniciId, ilanId, adet);
    return {
      id: r.id,
      ilan_id: r.ilan_id,
      adet: r.adet,
      qr_kodu: r.qr_kodu,
      durum: r.durum,
      son_gecerlilik: r.son_gecerlilik,
    };
  }

  // DELETE /api/rezervasyonlar/:id  (kullanıcı vazgeçti)
  @Delete(':id')
  @HttpCode(204)
  iptal(
    @KullaniciId() kullaniciId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rezervasyonService.iptal(kullaniciId, id);
  }

  // POST /api/rezervasyonlar/teslim { "qr_kodu": "..." }  (işletme okutur)
  @Post('teslim')
  @HttpCode(200)
  teslim(
    @KullaniciId() isletmeSahibiId: string,
    @Body('qr_kodu') qrKodu: unknown,
  ) {
    if (typeof qrKodu !== 'string' || qrKodu.length === 0) {
      throw new BadRequestException('qr_kodu gerekli');
    }
    return this.rezervasyonService.teslimEt(isletmeSahibiId, qrKodu);
  }
}
