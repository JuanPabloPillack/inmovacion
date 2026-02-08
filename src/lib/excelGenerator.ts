// src/lib/excelGenerator.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS, { Fill, Borders } from "exceljs";

/**
 * ==========================================================
 *     INTERFAZ CobranzaForExcel
 * ==========================================================
 */
export interface CobranzaForExcel {
  id_cobranza: number;
  id_inmueble: number | null;
  id_contrato: number | null;

  cliente: {
    nombre: string;
      apellido: string;
    email: string | null;
    telefono: string | null;
  };

  inmueble?: {
    titulo: string;
    ubicacion: {
      direccion: string;
    };
  };

  concepto: string;
  monto: number;
  fecha_cobranza: string;

  numero_recibo?: string | number | null;

  genera_recibo: boolean;
  pagado: boolean;
  observaciones: string | null;

  total_cobrar: number;
  total_cobrado: number;
  a_cobrar: number;

  unFuncional?: string;
  contratoStr?: string;

  ipcAumento?: string;
  ipcValor?: number | null;
}

/* ==========================================================
 *   Helpers
 * ========================================================== */
function getMonthName(monthNum: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[monthNum - 1] || "";
}

function numberToSpanishWords(n: number): string {
  if (n === 0) return "CERO";

  const units = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  function convertLessThan1000(x: number): string {
    if (x < 20) return units[x];
    if (x < 100) {
      const t = Math.floor(x / 10);
      const u = x % 10;
      return u ? `${tens[t]} Y ${units[u]}` : tens[t];
    }
    const h = Math.floor(x / 100);
    const rem = x % 100;
    if (rem === 0) return hundreds[h];
    if (h === 1 && rem < 10) return `CIENTO ${units[rem]}`;
    return `${hundreds[h]} ${convertLessThan1000(rem)}`;
  }

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  let res = "";
  if (thousands > 0) res += `${convertLessThan1000(thousands)} MIL `;
  if (rest > 0) res += convertLessThan1000(rest);
  return res.trim().toUpperCase();
}

function formatContratoStr(contrato?: { fecha_inicio: Date; fecha_fin: Date }): string {
  if (!contrato) return "";
  const fmt = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "-");
  return `${fmt(contrato.fecha_inicio)} a ${fmt(contrato.fecha_fin)}`;
}

/* ==========================================================
 *   FUNCIÓN PRINCIPAL
 * ========================================================== */
export interface IPCData {
  mes: number | null;
  anio: number | null;
  valor: number | null;
}

export async function generarExcelRendicion(
  numeroRendicion: string | number,
  fechaRendicion: string,
  cobranzas: CobranzaForExcel[],
  ipcData?: IPCData,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Parseo de fecha
  const [day, monthStr, yearStr] = fechaRendicion.split("-");
  const dayNum = Number(day);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const monthName = getMonthName(month);
  const shortMonth = monthName.substring(0, 3);
  const dayPad = day.padStart(2, "0");
  const monthPad = monthStr.padStart(2, "0");

  const date = new Date();
  const dateSerial = Math.floor(date.getTime() / 86400000) + 25569;
  const fechaFormateada = `${dayPad}-${monthPad}-${year}`; // para mostrar en recibos

  // Hoja principal
  const sheetName = `Rend ${numeroRendicion} - ${shortMonth} ${year}`;
  const sheetR = workbook.addWorksheet(sheetName);

  // Ancho de columnas
  sheetR.columns = [
    { width: 5 },    // A
    { width: 60 },   // B
    { width: 15 },   // C
    { width: 15 },   // D
    { width: 15 },   // E
    { width: 30 },   // F
    { width: 15 },   // G
    { width: 10 },   // H
    { width: 10 },   // I
    { width: 10 }    // J
  ];

  // Alineaciones
  sheetR.getColumn("B").alignment = { horizontal: "left", wrapText: true, vertical: "middle" };
  sheetR.getColumn("C").alignment = { horizontal: "right", vertical: "middle" };
  sheetR.getColumn("D").alignment = { horizontal: "right", vertical: "middle" };
  sheetR.getColumn("E").alignment = { horizontal: "right", vertical: "middle" };
  sheetR.getColumn("F").alignment = { horizontal: "left", vertical: "middle" };
  sheetR.getColumn("G").alignment = { horizontal: "right", vertical: "middle" };

  // Estilos
  const headerFill: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  const totalFill: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFE699" },
  };

  const thinBorder: Borders = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
    diagonal: {},
  };

  // Encabezado
  sheetR.getCell("B1").value = "GBS & ASOCIADOS";
  sheetR.getCell("B1").font = { bold: true, size: 14 };

  let nroRendicion = "";

if (numeroRendicion !== null && numeroRendicion !== undefined) {
  const str = String(numeroRendicion);

  // extrae el número final (por ejemplo: "rendicion_4" → "4")
  const match = str.match(/\d+$/);

  nroRendicion = match ? match[0] : str;
}

sheetR.getCell("B2").value = `Rendición Nº ${nroRendicion}`;
sheetR.getCell("B2").font = { bold: true, size: 12 };

  const currentYear = new Date().getFullYear();

sheetR.getCell("B3").value = `Período (${currentYear}):`;
  sheetR.getCell("B3").font = { bold: true };
  sheetR.getCell("C3").value = monthName;
  sheetR.getCell("C3").font = { bold: true };

  // Headers ingresos
  sheetR.getCell("B5").value = "INGRESOS / Detalle a Cobrar";
  sheetR.getCell("C5").value = "Alquiler";
  sheetR.getCell("D5").value = "Total a cobrar";
  sheetR.getCell("E5").value = "Aumento IPC";
  sheetR.getCell("F5").value = "Contrato";

  ["B","C","D","E","F"].forEach(col => {
    const cell = sheetR.getCell(`${col}5`);
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = headerFill;
    cell.border = thinBorder;
  });
  sheetR.getCell("A5").border = thinBorder;

  // ────────────────────────────────────────────────
  //                INGRESOS
  // ────────────────────────────────────────────────

  let totalIngresos = 0;

  cobranzas.forEach((c, index) => {
    const rowNum = 7 + index;
    const alquiler = c.monto;
    const ipcValor = c.ipcValor ?? null;
    const totalCobrar = c.total_cobrar;

    totalIngresos += totalCobrar;

    sheetR.getCell(`A${rowNum}`).value = c.id_cobranza;
    sheetR.getCell(`B${rowNum}`).value = `${c.cliente.nombre}: ${c.unFuncional ? c.unFuncional + ": " : ""}${c.concepto}${c.observaciones ? ` - ${c.observaciones}` : ""}`;
    sheetR.getCell(`C${rowNum}`).value = alquiler;
    sheetR.getCell(`C${rowNum}`).numFmt = '"$" #,##0.00';
    sheetR.getCell(`D${rowNum}`).value = totalCobrar;
    sheetR.getCell(`D${rowNum}`).numFmt = '"$" #,##0.00';

    if (ipcValor != null) {
      sheetR.getCell(`E${rowNum}`).value = ipcValor;
sheetR.getCell(`E${rowNum}`).numFmt = "0.00%";
    }

    sheetR.getCell(`F${rowNum}`).value = c.contratoStr ?? "";

    ["A","B","C","D","E","F"].forEach(col => {
      sheetR.getCell(`${col}${rowNum}`).border = thinBorder;
    });
  });

  // Total ingresos
  const totalIngresosRow = 7 + cobranzas.length;
  sheetR.mergeCells(`B${totalIngresosRow}:C${totalIngresosRow}`);
  sheetR.getCell(`B${totalIngresosRow}`).value = "TOTAL INGRESOS";
  sheetR.getCell(`B${totalIngresosRow}`).font = { bold: true };
  sheetR.getCell(`B${totalIngresosRow}`).alignment = { horizontal: "right" };
  sheetR.getCell(`B${totalIngresosRow}`).fill = totalFill;
  sheetR.getCell(`D${totalIngresosRow}`).value = totalIngresos;
  sheetR.getCell(`D${totalIngresosRow}`).numFmt = '"$" #,##0.00';
  sheetR.getCell(`D${totalIngresosRow}`).fill = totalFill;

  ["A","B","C","D","E","F"].forEach(col => {
    sheetR.getCell(`${col}${totalIngresosRow}`).border = thinBorder;
  });

  // ────────────────────────────────────────────────
  //                EGRESOS
  // ────────────────────────────────────────────────

  const egresosStartRow = totalIngresosRow + 3;
  sheetR.getCell(`B${egresosStartRow}`).value = "EGRESOS";
  sheetR.getCell(`B${egresosStartRow}`).font = { bold: true, size: 12 };

  const crearSeccionEgresos = (titulo: string, startRow: number, totalLabel: string) => {
    sheetR.mergeCells(`B${startRow}:F${startRow}`);
    const headerCell = sheetR.getCell(`B${startRow}`);
    headerCell.value = titulo;
    headerCell.font = { bold: true };
    headerCell.alignment = { horizontal: "center" };
    headerCell.fill = headerFill;

    for (let i = 0; i < 4; i++) {
      const row = startRow + 1 + i;
      sheetR.getCell(`B${row}`).value = "";
      sheetR.getCell(`G${row}`).value = "";
      sheetR.getCell(`G${row}`).numFmt = '"$" #,##0.00';

      ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
        sheetR.getCell(`${col}${row}`).border = thinBorder;
      });
    }

    const totalRow = startRow + 5;
    sheetR.mergeCells(`B${totalRow}:F${totalRow}`);
    const totalCell = sheetR.getCell(`B${totalRow}`);
    totalCell.value = totalLabel;
    totalCell.font = { bold: true };
    totalCell.alignment = { horizontal: "right" };
    totalCell.fill = totalFill;

    sheetR.getCell(`G${totalRow}`).value = { formula: `SUM(G${startRow+1}:G${startRow+4})`, result: 0 };
    sheetR.getCell(`G${totalRow}`).numFmt = '"$" #,##0.00';
    sheetR.getCell(`G${totalRow}`).fill = totalFill;

    ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
      sheetR.getCell(`${col}${totalRow}`).border = thinBorder;
    });

    return totalRow;
  };

  const ssAdmStartRow = egresosStartRow + 2;
  const ssAdmTotalRow = crearSeccionEgresos("SS Adm 10%/Mensual/A cargo Propietario", ssAdmStartRow, "Total SS Adm 10%");

  const ssAdmCobradoStartRow = ssAdmTotalRow + 2;
  const ssAdmCobradoTotalRow = crearSeccionEgresos("SS Adm Cobrado a Inquilinos en ingresos", ssAdmCobradoStartRow, "Total SS Adm Cobrado");

  const gtosMRow = ssAdmCobradoTotalRow + 2;
  const totalGtosRow = crearSeccionEgresos("Gtos Mantenimiento (CON COMISIÓN DEL 10%)", gtosMRow, "Total Gtos Mantenimiento");

  const impRow = totalGtosRow + 2;
  const impTotalRow = crearSeccionEgresos("Impuestos - Servicios y Pagos a cuenta (SIN COMISIÓN DEL 10%)", impRow, "Total Impuestos");

  // Saldo Anterior (ahora dentro de egresos)
  const sdoAntRow = impTotalRow + 3;
  sheetR.mergeCells(`B${sdoAntRow}:F${sdoAntRow}`);
  sheetR.getCell(`B${sdoAntRow}`).value = "Saldo Anterior";
  sheetR.getCell(`B${sdoAntRow}`).font = { bold: true, italic: true };
  sheetR.getCell(`B${sdoAntRow}`).alignment = { horizontal: "right" };

  const sdoAnt = 0;

sheetR.getCell(`G${sdoAntRow}`).value = sdoAnt;

// opcional: dejar explícito que es editable
sheetR.getCell(`G${sdoAntRow}`).note = "Ingrese manualmente el saldo anterior si corresponde";

  sheetR.getCell(`G${sdoAntRow}`).numFmt = '"$" #,##0.00';

  ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
    sheetR.getCell(`${col}${sdoAntRow}`).border = thinBorder;
  });

  // Total Egresos (incluye saldo anterior como resta)
  const totalEgrRow = sdoAntRow + 2;
  sheetR.mergeCells(`B${totalEgrRow}:F${totalEgrRow}`);
  sheetR.getCell(`B${totalEgrRow}`).value = "TOTAL EGRESOS";
  sheetR.getCell(`B${totalEgrRow}`).font = { bold: true };
  sheetR.getCell(`B${totalEgrRow}`).alignment = { horizontal: "right" };
  sheetR.getCell(`B${totalEgrRow}`).fill = totalFill;

  sheetR.getCell(`G${totalEgrRow}`).value = {
    formula: `G${ssAdmTotalRow} + G${ssAdmCobradoTotalRow} + G${totalGtosRow} + G${impTotalRow}`,
    result: 0
  };
  sheetR.getCell(`G${totalEgrRow}`).numFmt = '"$" #,##0.00';
  sheetR.getCell(`G${totalEgrRow}`).fill = totalFill;

  ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
    sheetR.getCell(`${col}${totalEgrRow}`).border = thinBorder;
  });

  // Saldo Final
  const saldoFinalRow = totalEgrRow + 2;
  sheetR.mergeCells(`B${saldoFinalRow}:F${saldoFinalRow}`);
  sheetR.getCell(`B${saldoFinalRow}`).value = `SALDO FINAL ${dayPad}-${monthPad}-${year}`;
  sheetR.getCell(`B${saldoFinalRow}`).font = { bold: true, size: 12 };
  sheetR.getCell(`B${saldoFinalRow}`).alignment = { horizontal: "right" };
  sheetR.getCell(`B${saldoFinalRow}`).fill = totalFill;

  sheetR.getCell(`G${saldoFinalRow}`).value = {
    formula: `D${totalIngresosRow} - G${totalEgrRow} - G${sdoAntRow}`,
    result: totalIngresos - 0 - sdoAnt
  };

  sheetR.getCell(`G${saldoFinalRow}`).numFmt = '"$" #,##0.00';
  sheetR.getCell(`G${saldoFinalRow}`).fill = totalFill;

  ["A","B","C","D","E","F","G","H","I","J"].forEach(col => {
    sheetR.getCell(`${col}${saldoFinalRow}`).border = thinBorder;
  });

  // Firma
  const firmaRow = saldoFinalRow + 3;
  sheetR.getCell(`B${firmaRow}`).value = "Firma: ………………………………………………………………………………………..";
  sheetR.getCell(`B${firmaRow}`).font = { italic: true, size: 11 };

 // ────────────────────────────────────────────────
  //   HOJA RECIBOS ── estilo ajustado al archivo de muestra
  // ────────────────────────────────────────────────

  const sheetRec = workbook.addWorksheet("RECIBOS ");

  let nro = "";

if (numeroRendicion !== null && numeroRendicion !== undefined) {
  const str = String(numeroRendicion);

  // extrae el número después del _
  const match = str.match(/\d+$/);

  nro = match ? match[0] : str;
}




  sheetRec.columns = [
    { width: 11.44 }, // A
    { width: 12 }, // B
    { width: 11.44 }, // C
    { width: 12.66 }, // D
    { width: 11.44 }, // E
    { width: 11.44 }, // F
    { width: 16.44 }, // G
    { width: 11.44 }  // H
  ];

  const mediumBorder: Partial<Borders> = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" }
  };

  const thinTopBorder: Partial<Borders> = {
    top: { style: "thin" }
  };

  const titleFont = { name: "Calibri", size: 11, bold: true };
  const labelFont = { name: "Calibri", size: 11, bold: true };
  const valueFont = { name: "Calibri", size: 11, bold: false };
  const firmaFont = { name: "Calibri", size: 11, italic: true, bold: false };
  const centerAlignment = { horizontal: "center", vertical: "middle" } as const;
  const leftAlignment = { horizontal: "left", vertical: "middle", wrapText: true } as const;
  const rightAlignment = { horizontal: "right", vertical: "middle" } as const;

  let currentRow = 1;

  cobranzas.forEach((c, index) => {
    const startRow = currentRow;
    const total = Math.round(c.total_cobrar ?? c.monto);
    const spelled = numberToSpanishWords(total);
    const unFunc = (c.unFuncional ?? 
      (c.inmueble ? `${c.inmueble.ubicacion.direccion}: ${c.inmueble.titulo}` : "UN. FUNCIONAL")).toUpperCase().trim();

    const recibidoDe = `${c.cliente.nombre} ${c.cliente.apellido}`.toUpperCase();
    const concepto = `${c.cliente.nombre} ${c.cliente.apellido}: ${c.concepto}${c.observaciones ? ` ${c.observaciones}` : ""}`;

    // Fila 1: Títulos (merged y centrados)
    sheetRec.mergeCells(`A${currentRow}:D${currentRow}`);
    sheetRec.getCell(`A${currentRow}`).value = "RECIBO ORIGINAL";
    sheetRec.getCell(`A${currentRow}`).font = titleFont;
    sheetRec.getCell(`A${currentRow}`).alignment = centerAlignment;

    sheetRec.mergeCells(`E${currentRow}:H${currentRow}`);
    sheetRec.getCell(`E${currentRow}`).value = "RECIBO DUPLICADO";
    sheetRec.getCell(`E${currentRow}`).font = titleFont;
    sheetRec.getCell(`E${currentRow}`).alignment = centerAlignment;

    // Bordes top y left/right para primera fila
    ['A', 'E'].forEach(col => {
      const { bottom, ...borderWithoutBottom } = mediumBorder;
      sheetRec.getCell(`${col}${currentRow}`).border = borderWithoutBottom as Borders;
    });
    ['D', 'H'].forEach(col => {
      const { bottom, ...borderWithoutBottom } = mediumBorder;
      sheetRec.getCell(`${col}${currentRow}`).border = borderWithoutBottom as Borders;
    });
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { top: { style: "medium" } } as Borders);

    currentRow++;

    // Fila 2: Importe
    sheetRec.getCell(`A${currentRow}`).value = "IMPORTE";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`C${currentRow}`).value = total;
    sheetRec.getCell(`C${currentRow}`).font = labelFont;
    sheetRec.getCell(`C${currentRow}`).alignment = centerAlignment;
    sheetRec.getCell(`C${currentRow}`).numFmt = '_(* #.##0_);_(* \\(#.##0\\);_(* "-"_);_(@_)';

    sheetRec.getCell(`E${currentRow}`).value = "IMPORTE";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`G${currentRow}`).value = total;
    sheetRec.getCell(`G${currentRow}`).font = labelFont;
    sheetRec.getCell(`G${currentRow}`).alignment = centerAlignment;
    sheetRec.getCell(`G${currentRow}`).numFmt = '_(* #.##0_);_(* \\(#.##0\\);_(* "-"_);_(@_)';

    // Bordes left/right
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders); // no border

    currentRow++;

    // Opcional: extra empty row for specific index if needed (e.g., for index 2)
    if (index === 2) {
      // Fila vacía extra
      ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
      ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
      ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);
      currentRow++;
    }

    // Fila 3: Un. Funcional (merged B:D, F:H)
    sheetRec.getCell(`A${currentRow}`).value = "UN. FUNCIONAL:";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`B${currentRow}:D${currentRow}`);
    sheetRec.getCell(`B${currentRow}`).value = unFunc;
    sheetRec.getCell(`B${currentRow}`).font = valueFont;
    sheetRec.getCell(`B${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`E${currentRow}`).value = "UN. FUNCIONAL:";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`F${currentRow}:H${currentRow}`);
    sheetRec.getCell(`F${currentRow}`).value = unFunc;
    sheetRec.getCell(`F${currentRow}`).font = valueFont;
    sheetRec.getCell(`F${currentRow}`).alignment = leftAlignment;

    // Bordes left/right
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 4: Recibí de (merged B:D, F:H)
    sheetRec.getCell(`A${currentRow}`).value = "RECIBÍ DE";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`B${currentRow}:D${currentRow}`);
    sheetRec.getCell(`B${currentRow}`).value = recibidoDe;
    sheetRec.getCell(`B${currentRow}`).font = valueFont;
    sheetRec.getCell(`B${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`E${currentRow}`).value = "RECIBÍ DE";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`F${currentRow}:H${currentRow}`);
    sheetRec.getCell(`F${currentRow}`).value = recibidoDe;
    sheetRec.getCell(`F${currentRow}`).font = valueFont;
    sheetRec.getCell(`F${currentRow}`).alignment = leftAlignment;

    // Bordes
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 5: Concepto de pago (merged B:D, F:H)
    sheetRec.getCell(`A${currentRow}`).value = "CONCEPTO DE PAGO";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`B${currentRow}:D${currentRow}`);
    sheetRec.getCell(`B${currentRow}`).value = concepto;
    sheetRec.getCell(`B${currentRow}`).font = valueFont;
    sheetRec.getCell(`B${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`E${currentRow}`).value = "CONCEPTO DE PAGO";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`F${currentRow}:H${currentRow}`);
    sheetRec.getCell(`F${currentRow}`).value = concepto;
    sheetRec.getCell(`F${currentRow}`).font = valueFont;
    sheetRec.getCell(`F${currentRow}`).alignment = leftAlignment;

    // Bordes
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 6: Total a pagar (merged B:D, F:H)
    sheetRec.getCell(`A${currentRow}`).value = "TOTAL A PAGAR: ";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`B${currentRow}:D${currentRow}`);
    sheetRec.getCell(`B${currentRow}`).value = spelled;
    sheetRec.getCell(`B${currentRow}`).font = valueFont;
    sheetRec.getCell(`B${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`E${currentRow}`).value = "TOTAL A PAGAR: ";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.mergeCells(`F${currentRow}:H${currentRow}`);
    sheetRec.getCell(`F${currentRow}`).value = spelled;
    sheetRec.getCell(`F${currentRow}`).font = valueFont;
    sheetRec.getCell(`F${currentRow}`).alignment = leftAlignment;

    // Bordes
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 7: Vacía
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 8: Firma (merged y centrada, con thin top)
    sheetRec.mergeCells(`A${currentRow}:D${currentRow}`);
    sheetRec.getCell(`A${currentRow}`).value = "Firma Administración-Por cta propietario";
    sheetRec.getCell(`A${currentRow}`).font = firmaFont;
    sheetRec.getCell(`A${currentRow}`).alignment = centerAlignment;

    sheetRec.mergeCells(`E${currentRow}:H${currentRow}`);
    sheetRec.getCell(`E${currentRow}`).value = "Firma Administración-Por cta propietario";
    sheetRec.getCell(`E${currentRow}`).font = firmaFont;
    sheetRec.getCell(`E${currentRow}`).alignment = centerAlignment;

    // Bordes thin top + left/right
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = thinTopBorder as Borders);
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { ...sheetRec.getCell(`${col}${currentRow}`).border, left: { style: "medium" } });
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { ...sheetRec.getCell(`${col}${currentRow}`).border, right: { style: "medium" } });

    currentRow++;

    // Fila 9: Fecha
    sheetRec.getCell(`A${currentRow}`).value = "Fecha";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`B${currentRow}`).value = date;
    sheetRec.getCell(`B${currentRow}`).font = valueFont;
    sheetRec.getCell(`B${currentRow}`).alignment = leftAlignment;
    sheetRec.getCell(`B${currentRow}`).numFmt = "dd/mm/yyyy";

    sheetRec.getCell(`E${currentRow}`).value = "Fecha";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`F${currentRow}`).value = date;
    sheetRec.getCell(`F${currentRow}`).font = valueFont;
    sheetRec.getCell(`F${currentRow}`).alignment = leftAlignment;
    sheetRec.getCell(`F${currentRow}`).numFmt = "dd/mm/yyyy";

    // Bordes left/right
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = {} as Borders);

    currentRow++;

    // Fila 10: Forma de pago
    sheetRec.getCell(`A${currentRow}`).value = "Forma de pago: ";
    sheetRec.getCell(`A${currentRow}`).font = labelFont;
    sheetRec.getCell(`A${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`C${currentRow}`).value = "Rend. Nº";
    sheetRec.getCell(`C${currentRow}`).font = valueFont;
    sheetRec.getCell(`C${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`D${currentRow}`).value = nro;
sheetRec.getCell(`D${currentRow}`).numFmt = "@";
    sheetRec.getCell(`D${currentRow}`).font = valueFont;
    sheetRec.getCell(`D${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`E${currentRow}`).value = "Forma de pago: ";
    sheetRec.getCell(`E${currentRow}`).font = labelFont;
    sheetRec.getCell(`E${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`G${currentRow}`).value = "Rend. Nº";
    sheetRec.getCell(`G${currentRow}`).font = valueFont;
    sheetRec.getCell(`G${currentRow}`).alignment = leftAlignment;

    sheetRec.getCell(`H${currentRow}`).value = nro;
sheetRec.getCell(`H${currentRow}`).numFmt = "@";

    sheetRec.getCell(`H${currentRow}`).font = valueFont;
    sheetRec.getCell(`H${currentRow}`).alignment = leftAlignment;

    // Bordes bottom + left/right
    ['A', 'E'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { left: { style: "medium" }, bottom: { style: "medium" } } as Borders);
    ['D', 'H'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { right: { style: "medium" }, bottom: { style: "medium" } } as Borders);
    ['B', 'C', 'F', 'G'].forEach(col => sheetRec.getCell(`${col}${currentRow}`).border = { bottom: { style: "medium" } } as Borders);

    currentRow += 1; // Espacio mínimo entre recibos, ajusta si necesitas más
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}