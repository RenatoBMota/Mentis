import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralPdfService } from './referral-pdf.service';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralPdfService],
})
export class ReferralsModule {}
