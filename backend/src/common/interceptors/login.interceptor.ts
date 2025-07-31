import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomBytes } from 'crypto';

function redact(obj: any, maxLen = 2048) {
  try {
    if (!obj) return obj;
    const clone: any = Array.isArray(obj) ? [...obj] : { ...obj };
    // Retire champs sensibles courants
    delete clone.password;
    delete clone.Authorization;
    delete clone.authorization;
    delete clone.cookie;
    delete clone.Cookies;
    const s = JSON.stringify(clone);
    return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
  } catch {
    return '[unserializable]';
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const id = randomBytes(5).toString('hex');
    const { method, originalUrl: url = req.url } = req;
    const ua = req.get?.('user-agent') || '';
    const ip = req.ip || req.socket?.remoteAddress || '';

    const isMultipart = /multipart\//i.test(
      req.headers?.['content-type'] || '',
    );
    const reqBody = isMultipart ? '[multipart]' : redact(req.body);

    const start = Date.now();
    this.logger.log(
      `→ ${id} ${method} ${url} ua="${ua}" ip=${ip} body=${reqBody}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const ms = Date.now() - start;
          const statusCode = res.statusCode;
          const size = res.getHeader?.('content-length');
          const preview = redact(data);
          this.logger.log(
            `← ${id} ${method} ${url} ${statusCode} ${ms}ms size=${size ?? '-'} body=${preview}`,
          );
        },
        error: (err) => {
          const ms = Date.now() - start;
          const statusCode = err?.status || res.statusCode || 500;
          const preview = redact(err?.response ?? { message: err?.message });
          this.logger.error(
            `× ${id} ${method} ${url} ${statusCode} ${ms}ms error=${preview}`,
          );
        },
      }),
    );
  }
}
