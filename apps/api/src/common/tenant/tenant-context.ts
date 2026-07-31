import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  tenantId: string;
  userId: string;
}

/**
 * Carrega o tenant autenticado durante o ciclo de vida da requisição (PRD 5.5).
 * Populado pelo TenantContextInterceptor logo após a autenticação JWT; consumido
 * pelo PrismaService (via $extends) para injetar o filtro de tenant automaticamente.
 */
@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<TenantContextStore>();

  run<T>(store: TenantContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  get(): TenantContextStore | undefined {
    return this.storage.getStore();
  }

  get tenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }
}
