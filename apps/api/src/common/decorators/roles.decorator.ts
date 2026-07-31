import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Papéis autorizados a acessar uma rota (RBAC — PRD 5.6). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
