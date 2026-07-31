import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordPdfService } from './medical-record-pdf.service';

@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, MedicalRecordPdfService],
})
export class MedicalRecordsModule {}
