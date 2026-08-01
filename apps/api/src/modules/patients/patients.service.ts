import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto';
import { ApiEnvelope } from '../../common/dto/api-envelope';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly crypto: CryptoService,
  ) {}

  private decryptClinicalFields(patient: Patient): Patient {
    return {
      ...patient,
      anamnesis: this.crypto.decryptOptional(patient.anamnesis) ?? null,
      treatmentPlan: this.crypto.decryptOptional(patient.treatmentPlan) ?? null,
    };
  }

  private get tenant() {
    const ctx = this.tenantContext.get();
    if (!ctx) {
      throw new Error('TENANT_CONTEXT_MISSING');
    }
    return ctx;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    const { tenantId, userId } = this.tenant;
    return this.prisma.patient.create({
      data: {
        tenantId,
        userId,
        fullName: dto.fullName,
        age: dto.age,
        phone: dto.phone,
        recurrenceType: dto.recurrenceType,
        pricePerSession: dto.pricePerSession,
      },
    });
  }

  async findAll(query: ListPatientsQueryDto): Promise<ApiEnvelope<Patient[]>> {
    const { tenantId } = this.tenant;
    const limit = query.limit ?? 20;

    const patients = await this.prisma.patient.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: query.status,
        fullName: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = patients.length > limit;
    const data = hasMore ? patients.slice(0, limit) : patients;

    return {
      data,
      meta: { next_cursor: hasMore ? data[data.length - 1].id : null },
    };
  }

  async findOne(id: string): Promise<Patient> {
    const { tenantId } = this.tenant;
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!patient) {
      throw new NotFoundException('PATIENT_NOT_FOUND');
    }
    return this.decryptClinicalFields(patient);
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(id);
    const { anamnesis, treatmentPlan, ...rest } = dto;
    const updated = await this.prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        anamnesis: this.crypto.encryptOptional(anamnesis),
        treatmentPlan: this.crypto.encryptOptional(treatmentPlan),
      },
    });
    return this.decryptClinicalFields(updated);
  }

  /** Exclusão lógica (soft-delete) — histórico clínico e financeiro nunca é perdido. */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
