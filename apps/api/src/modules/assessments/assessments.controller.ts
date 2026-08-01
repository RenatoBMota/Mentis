import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AssessmentsService } from './assessments.service';

/** RBAC (PRD 5.6): apenas o Profissional acessa conteúdo clínico. */
@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROFESSIONAL)
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.assessmentsService.findByPatient(patientId);
  }

  @Post(':patientId')
  create(@Param('patientId') patientId: string, @Body() dto: CreateAssessmentDto) {
    return this.assessmentsService.create(patientId, dto);
  }
}
