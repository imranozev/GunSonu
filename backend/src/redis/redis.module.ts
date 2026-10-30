import {
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');
// Abone (SUBSCRIBE) moduna geçen bağlantı başka komut çalıştıramaz, bu yüzden ayrı.
export const REDIS_ABONE = Symbol('REDIS_ABONE');

const baglantiAyarlari = (config: ConfigService) => ({
  host: config.get('REDIS_HOST', 'localhost'),
  port: Number(config.get('REDIS_PORT', 6379)),
});

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      // Redis kapalıyken komutlar kuyrukta beklemesin, hemen hata versin:
      // rezervasyon isteği gecikmez, süre takibini yedek tarama üstlenir.
      useFactory: (config: ConfigService) =>
        new Redis({ ...baglantiAyarlari(config), enableOfflineQueue: false }),
    },
    {
      provide: REDIS_ABONE,
      inject: [ConfigService],
      // Abonelik Redis gelene kadar bekler; yeniden bağlanınca otomatik yenilenir.
      useFactory: (config: ConfigService) =>
        new Redis({ ...baglantiAyarlari(config), maxRetriesPerRequest: null }),
    },
  ],
  exports: [REDIS, REDIS_ABONE],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(REDIS_ABONE) private readonly abone: Redis,
  ) {}

  onApplicationShutdown() {
    // quit() Redis yokken kuyrukta sonsuza kadar bekleyebilir; doğrudan kes
    this.redis.disconnect();
    this.abone.disconnect();
  }
}
