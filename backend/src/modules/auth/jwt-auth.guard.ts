import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard global :
 * – Laisse passer toutes les requêtes non-POST (lecture publique)
 * – Exige un JWT valide pour les requêtes POST (écriture)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method !== 'POST') {
      return true; // aucune protection sur GET, PUT, etc. sauf POST
    }
    return super.canActivate(context);
  }
}
