import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentsService } from './documents.service';
import { MAX_DOCUMENT_SIZE_BYTES } from './document-storage';

/** RBAC (PRD 5.6): apenas o Profissional acessa a Biblioteca Digital do paciente. */
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROFESSIONAL)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.documentsService.findByPatient(patientId);
  }

  @ApiConsumes('multipart/form-data')
  @Post(':patientId')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES } }))
  upload(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.upload(patientId, file, dto);
  }

  @Get(':patientId/:documentId/download')
  async download(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filename, mimeType, buffer } = await this.documentsService.download(patientId, documentId);
    // Ver referrals.controller.ts: filename precisa de fallback ASCII (RFC 6266).
    const asciiFilename = filename.normalize('NFD').replace(/[̀-ͯ]/g, '');
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    return new StreamableFile(buffer);
  }

  @Delete(':patientId/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('patientId') patientId: string, @Param('documentId') documentId: string) {
    return this.documentsService.remove(patientId, documentId);
  }
}
