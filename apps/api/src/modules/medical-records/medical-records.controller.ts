import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { ExportMedicalRecordDto } from './dto/export-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

/** RBAC (PRD 5.6): apenas o Profissional acessa conteúdo clínico. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROFESSIONAL)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findByPatient(patientId);
  }

  @Post(':patientId')
  create(@Param('patientId') patientId: string, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(patientId, dto);
  }

  @Post(':patientId/export-pdf')
  exportPdf(@Param('patientId') patientId: string, @Body() dto: ExportMedicalRecordDto) {
    return this.medicalRecordsService.exportPdf(patientId, dto.reason);
  }
}
