import { Body, Controller, Get, Param, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { ExportMedicalRecordDto } from './dto/export-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

/** RBAC (PRD 5.6): apenas o Profissional acessa conteúdo clínico. */
@ApiTags('Medical Records')
@ApiBearerAuth()
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

  @ApiProduces('application/pdf')
  @Post(':patientId/export-pdf')
  async exportPdf(
    @Param('patientId') patientId: string,
    @Body() dto: ExportMedicalRecordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filename, buffer } = await this.medicalRecordsService.exportPdf(patientId, dto.reason);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
