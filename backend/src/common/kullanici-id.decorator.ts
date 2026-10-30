import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// TODO: JWT + SMS doğrulama gelince kullanıcı token'dan okunacak.
// Şimdilik geliştirme için `x-kullanici-id` başlığından alınıyor.
export const KullaniciId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const id = ctx.switchToHttp().getRequest<Request>().header('x-kullanici-id');
    if (!id || !UUID.test(id)) {
      throw new UnauthorizedException('x-kullanici-id başlığı gerekli');
    }
    return id;
  },
);
