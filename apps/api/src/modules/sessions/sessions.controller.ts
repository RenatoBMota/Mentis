import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ListSessionsQueryDto } from './dto/list-sessions-query.dto';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(@Query() query: ListSessionsQueryDto) {
    return this.sessionsService.list(query);
  }

  @Patch(':appointmentId/complete')
  complete(@Param('appointmentId') appointmentId: string) {
    return this.sessionsService.complete(appointmentId);
  }

  @Patch(':appointmentId/no-show')
  noShow(@Param('appointmentId') appointmentId: string) {
    return this.sessionsService.noShow(appointmentId);
  }
}
