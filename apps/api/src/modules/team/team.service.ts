import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { AuthService } from '../auth/auth.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';

const MEMBER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  planType: true,
  createdAt: true,
} as const;

/** Gestão de equipe: o Profissional (owner) cadastra os demais usuários do seu consultório/clínica. */
@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** GET /v1/team — membros do tenant, mais antigos primeiro. */
  async findAll() {
    const { tenantId } = this.tenantContext.get()!;
    const members = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      select: MEMBER_SELECT,
    });
    return { data: members };
  }

  /** POST /v1/team */
  async create(dto: CreateTeamMemberDto) {
    const { tenantId, userId } = this.tenantContext.get()!;
    const passwordHash = await AuthService.hashPassword(dto.password);

    try {
      const member = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            tenantId,
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: dto.role,
          },
          select: MEMBER_SELECT,
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            actorId: userId,
            entity: 'User',
            entityId: created.id,
            action: 'CREATE',
          },
        });

        return created;
      });

      return { data: member };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('EMAIL_ALREADY_IN_USE');
      }
      throw err;
    }
  }
}
