import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Referral } from '@prisma/client';

export interface ReferralPdfInput {
  referral: Referral;
  patientName: string;
  patientAge: number | null;
  professionalName: string;
  crp: string | null;
  generatedAt: Date;
}

const MARGIN = 50;

/**
 * Documento de encaminhamento pronto para impressão: cabeçalho com
 * identificação do profissional, bloco de identificação do paciente,
 * corpo do encaminhamento e rodapé com linha de assinatura — em cada
 * página, para o caso de o texto ocupar mais de uma.
 */
@Injectable()
export class ReferralPdfService {
  async generate(input: ReferralPdfInput): Promise<Buffer> {
    const doc = new PDFDocument({ margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    this.renderHeader(doc, input);
    this.renderPatientBlock(doc, input);
    this.renderBody(doc, input);
    this.renderSignatureLine(doc, input);
    this.applyFooterToAllPages(doc, input);

    doc.end();
    return done;
  }

  private renderHeader(doc: PDFKit.PDFDocument, input: ReferralPdfInput): void {
    doc.fontSize(9).fillColor('#666666').text('MENTIS · SISTEMA CLÍNICO', { align: 'right' });
    doc.moveDown(0.6);

    doc
      .fontSize(18)
      .fillColor('black')
      .font('Helvetica-Bold')
      .text(`Encaminhamento — ${input.referral.type}`, { align: 'left' });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica').fillColor('#333333');
    doc.text(`Profissional responsável: ${input.professionalName}${input.crp ? ` (CRP ${input.crp})` : ''}`);
    doc.text(`Data de emissão: ${input.generatedAt.toLocaleDateString('pt-BR')}`);
    if (input.referral.recipient) {
      doc.text(`Destinatário: ${input.referral.recipient}`);
    }

    doc.moveDown();
    doc
      .strokeColor('#cccccc')
      .moveTo(MARGIN, doc.y)
      .lineTo(doc.page.width - MARGIN, doc.y)
      .stroke();
    doc.moveDown();
  }

  private renderPatientBlock(doc: PDFKit.PDFDocument, input: ReferralPdfInput): void {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text('Paciente');
    doc.font('Helvetica').fillColor('#333333');
    doc.text(`Nome: ${input.patientName}`);
    if (input.patientAge) {
      doc.text(`Idade: ${input.patientAge} anos`);
    }
    doc.moveDown();
  }

  private renderBody(doc: PDFKit.PDFDocument, input: ReferralPdfInput): void {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text('Conteúdo do encaminhamento');
    doc.moveDown(0.3);
    doc.font('Helvetica').fillColor('black').text(input.referral.content, { align: 'justify' });
    doc.moveDown(2);
  }

  private renderSignatureLine(doc: PDFKit.PDFDocument, input: ReferralPdfInput): void {
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }
    const lineY = doc.page.height - 130;
    doc
      .strokeColor('#333333')
      .moveTo(MARGIN, lineY)
      .lineTo(MARGIN + 220, lineY)
      .stroke();
    doc
      .fontSize(9)
      .fillColor('#333333')
      .text(`${input.professionalName}${input.crp ? ` — CRP ${input.crp}` : ''}`, MARGIN, lineY + 4);
    doc.text('Assinatura e carimbo', MARGIN, lineY + 16);
  }

  private applyFooterToAllPages(doc: PDFKit.PDFDocument, input: ReferralPdfInput): void {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      const { width, height } = doc.page;

      // Escrever dentro da margem inferior (abaixo de height - MARGIN) faz o
      // pdfkit interpretar como overflow e criar uma página extra em branco.
      // Zerar a margem inferior temporariamente evita isso.
      const bottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Documento gerado pelo Mentis em ${input.generatedAt.toLocaleString('pt-BR')} · página ${i + 1} de ${pageCount}`,
          MARGIN,
          height - 30,
          { width: width - MARGIN * 2, align: 'center' },
        );
      doc.page.margins.bottom = bottomMargin;
    }
  }
}
