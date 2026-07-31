import { IsUUID } from 'class-validator';

export class SendChargeLinkDto {
  @IsUUID()
  sessionRecordId!: string;
}
