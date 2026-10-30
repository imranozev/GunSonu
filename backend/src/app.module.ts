import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KullaniciModule } from './modules/kullanici/kullanici.module';
import { IsletmeModule } from './modules/isletme/isletme.module';
import { IlanModule } from './modules/ilan/ilan.module';
import { RezervasyonModule } from './modules/rezervasyon/rezervasyon.module';
import { DegerlendirmeModule } from './modules/degerlendirme/degerlendirme.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get('DB_USER', 'gunsonu'),
        password: config.get('DB_PASSWORD', 'gunsonu'),
        database: config.get('DB_NAME', 'gunsonu'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC') === 'true',
      }),
    }),
    RedisModule,
    KullaniciModule,
    IsletmeModule,
    IlanModule,
    RezervasyonModule,
    DegerlendirmeModule,
  ],
})
export class AppModule {}
