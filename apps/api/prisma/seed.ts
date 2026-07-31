import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/modules/auth/auth.service';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Consultório Dra. Mariana Souza' },
  });

  const passwordHash = await AuthService.hashPassword('psiflow-dev-2026');

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Dra. Mariana Souza',
      email: 'mariana@example.com',
      passwordHash,
      crp: '06/123456',
      role: 'PROFESSIONAL',
      planType: 'PRO',
      pixKey: 'mariana@example.com',
    },
  });

  await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      fullName: 'Paciente Exemplo',
      age: 29,
      phone: '+5511999990000',
      recurrenceType: 'WEEKLY',
      pricePerSession: 200,
      status: 'ACTIVE',
    },
  });

  console.log(`Seed concluído. Login: ${user.email} / senha: psiflow-dev-2026`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
