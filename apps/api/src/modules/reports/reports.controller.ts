import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IsDateString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

class AttendanceQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance')
  attendance(@Query() query: AttendanceQueryDto) {
    return this.reportsService.attendance(new Date(query.from), new Date(query.to));
  }
}
