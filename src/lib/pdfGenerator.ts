//lib/pdfgenerator
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, StandardFonts } from "pdf-lib";

export interface CobranzaForPDF {
  id_cobranza: number;
  monto: number;
  total?: number;
  numero_recibo?: string | number | null;
  cliente: {
    nombre: string;
    email?: string | null;
    telefono?: string | null;
  };
  inmueble: any;
}

// Ahora retorna Promise<Buffer>
export async function generarPDFRecibo(data: CobranzaForPDF): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText(`RECIBO - ${data.cliente.nombre}`, { x: 50, y: 700, size: 14, font });
  page.drawText(`Monto: $${data.monto.toFixed(2)}`, { x: 50, y: 680, size: 12, font });

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}
