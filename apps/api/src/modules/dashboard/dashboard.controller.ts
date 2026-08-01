import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

const MIN_TREND_DAYS = 7;
const MAX_TREND_DAYS = 90;
const DEFAULT_TREND_DAYS = 30;

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('trend')
  trend(@Query('days') days?: string) {
    const parsed = Number(days);
    const clamped = Number.isFinite(parsed)
      ? Math.min(MAX_TREND_DAYS, Math.max(MIN_TREND_DAYS, Math.trunc(parsed)))
      : DEFAULT_TREND_DAYS;
    return this.dashboardService.trend(clamped);
  }
}
