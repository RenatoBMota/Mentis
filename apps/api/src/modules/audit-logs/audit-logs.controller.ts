import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';

class ListAuditLogsQueryDto {
  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}

/** GET /v1/audit-logs — restrito a Profissional/Supervisor (PRD 7.1, 11.3). */
@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROFESSIONAL, UserRole.SUPERVISOR)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  @Get()
  async list(@Query() query: ListAuditLogsQueryDto) {
    const { tenantId } = this.tenantContext.get()!;
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId, entity: query.entity, entityId: query.entityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { data: logs };
  }
}
