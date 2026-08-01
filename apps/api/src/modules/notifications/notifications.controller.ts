import { Controller, Get, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

/** Central de notificações in-app (sino no header). */
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: user.sub, channel: 'IN_APP' },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({
        where: { userId: user.sub, channel: 'IN_APP', readAt: null },
      }),
    ]);
    return { data: notifications, unreadCount };
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId: user.sub },
    });
    if (!notification) {
      throw new NotFoundException('NOTIFICATION_NOT_FOUND');
    }
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date() },
    });
    return { data: { id } };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: CurrentUserPayload) {
    await this.prisma.notification.updateMany({
      where: { userId: user.sub, channel: 'IN_APP', readAt: null },
      data: { readAt: new Date() },
    });
    return { data: { ok: true } };
  }
}
