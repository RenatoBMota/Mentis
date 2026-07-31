import { Global, Module } from '@nestjs/common';
import { TenantContext } from './tenant-context';
import { TenantContextInterceptor } from './tenant-context.interceptor';

/**
 * Providers registrados apenas no AppModule não ficam visíveis para os
 * módulos de domínio (encapsulamento de módulo do Nest) — TenantContext
 * precisa ser global para que Patients/Agenda/Financial/MedicalRecords/etc.
 * consigam injetá-lo.
 */
@Global()
@Module({
  providers: [TenantContext, TenantContextInterceptor],
  exports: [TenantContext, TenantContextInterceptor],
})
export class TenantContextModule {}
