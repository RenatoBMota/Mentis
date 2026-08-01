import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { QueueModule } from './queue/queue.module';
import { TenantContextModule } from './common/tenant/tenant-context.module';
import { TenantContextInterceptor } from './common/tenant/tenant-context.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { FinancialModule } from './modules/financial/financial.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global (PRD 7.2): 120 req/min por usuário autenticado.
    // Endpoints de WhatsApp aplicam limite mais restrito via @Throttle no controller.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    CryptoModule,
    QueueModule,
    TenantContextModule,
    AuthModule,
    PatientsModule,
    AgendaModule,
    SessionsModule,
    MedicalRecordsModule,
    FinancialModule,
    WhatsAppModule,
    ReportsModule,
    DashboardModule,
    AuditLogsModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
