//lib/excelgenerator
import ExcelJS from "exceljs";

/**
 * Tipos estrictos para el Excel
 */
export interface CobranzaForExcel {
  id_cobranza: number;
  cliente: { nombre: string };
  concepto: string;
  monto: number;
  fecha_cobranza?: string | Date;
  contrato?: string | null;
  aumento_ipc?: number | string | null;
  link_ipc?: string | null;
  pago_efvo?: number | null;
  total_cobrado?: number | null;
  a_cobrar?: number | null;
}

/**
 * Genera el Excel y devuelve un Buffer
 */
export async function generarExcelRendicion(
  rendicionNumber: string,
  periodoText: string,
  cobranzas: CobranzaForExcel[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Rendición");

  sheet.columns = [
    { key: "A", width: 6 },
    { key: "B", width: 40 },
    { key: "C", width: 14 },
    { key: "D", width: 16 },
    { key: "E", width: 12 },
    { key: "F", width: 14 },
    { key: "G", width: 14 },
    { key: "H", width: 18 },
    { key: "I", width: 22 },
    { key: "J", width: 16 },
  ];

  sheet.getRow(1).getCell(2).value = `Rendición Nº ${rendicionNumber}`;
  sheet.getRow(1).getCell(2).font = { bold: true, size: 14 };

  sheet.getRow(2).getCell(2).value = periodoText;
  sheet.getRow(2).getCell(2).font = { italic: true, size: 11 };

  const header = sheet.getRow(4);
  header.getCell(2).value = "INGRESOS/ Detalle a Cobrar";
  header.getCell(3).value = "Alquiler";
  header.getCell(4).value = "Total a cobrar";
  header.getCell(5).value = "Pago Efvo";
  header.getCell(6).value = "TOTAL COBRADO";
  header.getCell(7).value = "A cobrar";
  header.getCell(8).value = "Aumento IPC c/ 3 meses";
  header.getCell(9).value = "Link a aumentos IPC";
  header.getCell(10).value = "Contrato";

  for (let c = 2; c <= 10; c++) {
    const cell = header.getCell(c);
    cell.font = { bold: true };
    cell.border = { bottom: { style: "thin" } };
  }

  let rowIndex = 6;
  for (const c of cobranzas) {
    const row = sheet.getRow(rowIndex);
    row.getCell(2).value = c.concepto ?? `Cobranza ${c.id_cobranza}`;
    row.getCell(3).value = c.monto;
    row.getCell(4).value = c.total_cobrado ?? c.monto ?? 0;
    row.getCell(5).value = c.pago_efvo ?? null;
    row.getCell(6).value = c.total_cobrado ?? null;
    row.getCell(7).value = c.a_cobrar ?? null;
    row.getCell(8).value = c.aumento_ipc ?? null;
    row.getCell(9).value = c.link_ipc ?? null;
    row.getCell(10).value = c.contrato ?? null;

    for (const col of [3, 4, 5, 6, 7, 8]) {
      const cell = row.getCell(col);
      if (typeof cell.value === "number") {
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right" };
      }
    }
    row.commit();
    rowIndex++;
  }

  const totalRow = sheet.getRow(rowIndex + 1);
  totalRow.getCell(2).value = "TOTAL";
  totalRow.getCell(3).value = { formula: `SUM(C6:C${rowIndex - 1})` };
  totalRow.getCell(4).value = { formula: `SUM(D6:D${rowIndex - 1})` };
  totalRow.getCell(6).value = { formula: `SUM(F6:F${rowIndex - 1})` };
  totalRow.getCell(7).value = { formula: `SUM(G6:G${rowIndex - 1})` };

  for (const col of [3, 4, 6, 7]) {
    const cell = totalRow.getCell(col);
    cell.font = { bold: true };
    cell.numFmt = "#,##0.00";
  }

  // Retorna buffer en lugar de guardar archivo
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
