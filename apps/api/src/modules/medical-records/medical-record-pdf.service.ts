import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { MedicalRecord, Tag } from '@prisma/client';

export interface MedicalRecordPdfInput {
  patientName: string;
  professionalName: string;
  crp: string | null;
  generatedAt: Date;
  records: Array<MedicalRecord & { tags: Tag[] }>;
}

const WATERMARK_OPACITY = 0.08;
const MARGIN = 50;

/**
 * Gera o PDF do prontuário (RF-06). Marca d'água diagonal em toda página
 * com nome do profissional, CRP e data/hora de geração, para rastreabilidade
 * de cópias (PRD 8.3).
 */
@Injectable()
export class MedicalRecordPdfService {
  async generate(input: MedicalRecordPdfInput): Promise<Buffer> {
    const doc = new PDFDocument({ margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const watermarkText = this.buildWatermarkText(input);
    this.renderHeader(doc, input);

    if (input.records.length === 0) {
      doc.moveDown().fontSize(11).fillColor('black').text('Nenhuma evolução registrada até o momento.');
    }

    for (const record of input.records) {
      this.renderRecord(doc, record);
    }

    this.applyWatermarkToAllPages(doc, watermarkText);

    doc.end();
    return done;
  }

  private buildWatermarkText(input: MedicalRecordPdfInput): string {
    const crpPart = input.crp ? `CRP ${input.crp}` : 'CRP não informado';
    const timestamp = input.generatedAt.toLocaleString('pt-BR');
    return `${input.professionalName} · ${crpPart} · ${timestamp}`;
  }

  private renderHeader(doc: PDFKit.PDFDocument, input: MedicalRecordPdfInput): void {
    doc.fontSize(18).fillColor('black').text('Prontuário Clínico', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#333333');
    doc.text(`Paciente: ${input.patientName}`);
    doc.text(`Profissional responsável: ${input.professionalName}${input.crp ? ` (CRP ${input.crp})` : ''}`);
    doc.text(`Documento gerado em: ${input.generatedAt.toLocaleString('pt-BR')}`);
    doc.moveDown();
    doc
      .strokeColor('#cccccc')
      .moveTo(MARGIN, doc.y)
      .lineTo(doc.page.width - MARGIN, doc.y)
      .stroke();
    doc.moveDown();
  }

  private renderRecord(doc: PDFKit.PDFDocument, record: MedicalRecord & { tags: Tag[] }): void {
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
    }

    doc
      .fontSize(13)
      .fillColor('black')
      .text(`Sessão nº ${record.sessionNumber}`, { continued: false });
    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(`Registrado em: ${record.createdAt.toLocaleString('pt-BR')} · versão ${record.version}`);
    doc.moveDown(0.4);

    doc.fontSize(10).fillColor('black').font('Helvetica-Bold').text('Evolução');
    doc.font('Helvetica').text(record.evolutionText, { align: 'justify' });
    doc.moveDown(0.3);

    if (record.observations) {
      doc.font('Helvetica-Bold').text('Observações');
      doc.font('Helvetica').text(record.observations, { align: 'justify' });
      doc.moveDown(0.3);
    }

    if (record.stepsText) {
      doc.font('Helvetica-Bold').text('Próximos passos');
      doc.font('Helvetica').text(record.stepsText, { align: 'justify' });
      doc.moveDown(0.3);
    }

    if (record.tags.length > 0) {
      doc.font('Helvetica-Bold').text('Tags: ', { continued: true });
      doc.font('Helvetica').text(record.tags.map((tag) => tag.name).join(', '));
    }

    doc.moveDown();
    doc
      .strokeColor('#eeeeee')
      .moveTo(MARGIN, doc.y)
      .lineTo(doc.page.width - MARGIN, doc.y)
      .stroke();
    doc.moveDown();
  }

  private applyWatermarkToAllPages(doc: PDFKit.PDFDocument, text: string): void {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      const { width, height } = doc.page;

      doc.save();
      doc.rotate(-45, { origin: [width / 2, height / 2] });
      doc
        .fontSize(18)
        .fillColor('black', WATERMARK_OPACITY)
        .text(text, 0, height / 2 - 10, { width, align: 'center' });
      doc.restore();
    }
  }
}
