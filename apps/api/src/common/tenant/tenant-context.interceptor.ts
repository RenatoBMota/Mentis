import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from './tenant-context';

interface AuthenticatedRequest {
  user?: { sub: string; tenantId: string };
}

/**
 * Interceptor global: roda depois do JwtAuthGuard, então req.user já está populado.
 * Propaga tenantId/userId via AsyncLocalStorage para toda a árvore de chamadas da
 * requisição, isolando dados entre tenants mesmo se um service esquecer o filtro
 * explícito (segunda camada de defesa, reforçada por RLS no Postgres — PRD 5.5).
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      return next.handle();
    }

    return new Observable((subscriber) => {
      this.tenantContext.run(
        { tenantId: request.user!.tenantId, userId: request.user!.sub },
        () => next.handle().subscribe(subscriber),
      );
    });
  }
}
