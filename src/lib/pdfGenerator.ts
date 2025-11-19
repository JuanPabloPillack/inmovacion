// lib/pdfGenerator.ts
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

export async function generarPDFRecibo(data: CobranzaForPDF): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);

  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText(`RECIBO - ${data.cliente.nombre}`, {
    x: 50,
    y: 700,
    size: 18,
    font,
  });

  if (data.numero_recibo) {
    page.drawText(`N° Recibo: ${data.numero_recibo}`, {
      x: 50,
      y: 675,
      size: 12,
      font,
    });
  }

  page.drawText(`Monto original: $${data.monto.toFixed(2)}`, {
    x: 50,
    y: 655,
    size: 12,
    font,
  });

  if (data.total != null) {
    page.drawText(`Monto final: $${data.total.toFixed(2)}`, {
      x: 50,
      y: 635,
      size: 12,
      font,
    });
  }

  if (data.cliente.telefono) {
    page.drawText(`Teléfono: ${data.cliente.telefono}`, {
      x: 50,
      y: 615,
      size: 12,
      font,
    });
  }

  if (data.cliente.email) {
    page.drawText(`Email: ${data.cliente.email}`, {
      x: 50,
      y: 595,
      size: 12,
      font,
    });
  }

  return await pdf.save(); // <-- Uint8Array, perfecto
}
