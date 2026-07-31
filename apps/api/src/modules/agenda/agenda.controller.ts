import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AgendaService } from './agenda.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

class WeeklyQueryDto {
  @IsDateString()
  weekStart!: string;
}

@ApiTags('Agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('weekly')
  weekly(@Query() query: WeeklyQueryDto) {
    return this.agendaService.weekly(new Date(query.weekStart));
  }

  @Post('appointments')
  create(@Body() dto: CreateAppointmentDto) {
    return this.agendaService.create(dto);
  }
}
