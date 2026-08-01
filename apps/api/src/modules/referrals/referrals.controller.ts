import { Body, Controller, Get, Param, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ReferralsService } from './referrals.service';

/** RBAC (PRD 5.6): apenas o Profissional acessa conteúdo clínico. */
@ApiTags('Referrals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROFESSIONAL)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.referralsService.findByPatient(patientId);
  }

  @Post(':patientId')
  create(@Param('patientId') patientId: string, @Body() dto: CreateReferralDto) {
    return this.referralsService.create(patientId, dto);
  }

  @ApiProduces('application/pdf')
  @Get('pdf/:id')
  async pdf(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { filename, buffer } = await this.referralsService.generatePdf(id);
    // Ver medical-records.controller.ts: filename precisa de fallback ASCII
    // (RFC 6266) porque Content-Disposition só aceita Latin-1 no parâmetro
    // `filename`; `filename*` carrega o valor UTF-8 percent-encoded.
    const asciiFilename = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    return new StreamableFile(buffer);
  }
}
