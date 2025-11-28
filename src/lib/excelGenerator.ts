/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";

/**
 * ==========================================================
 *     INTERFAZ CobranzaForExcel
 * ==========================================================
 * Representa cada Cobranza ya "preparada" para el Excel.
 * Este objeto resulta del servicio antes de generar el archivo.
 *
 * - Se basa en el modelo Prisma real
 * - Incluye datos derivados (contratoStr, ipcAumento, unFuncional, etc)
 */
export interface CobranzaForExcel {
  id_cobranza: number;
  id_inmueble: number | null;
  id_contrato: number | null;

  cliente: {
    nombre: string;
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

  // Valores calculados en el servicio
  total_cobrar?: number;
  total_cobrado?: number;
  a_cobrar?: number;

  // Derivados
  unFuncional?: string;
  contratoStr?: string;

  // IPC
  ipcAumento?: string;
  ipcValor?: number | null;
}

/* ==========================================================
 *   Helper: Convertir número de mes a nombre en español
 * ========================================================== */
function getMonthName(monthNum: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[monthNum - 1] || "";
}

/* ==========================================================
 *   Helper: Convertir número a palabras en español
 * ==========================================================
 * Ej: 154 → "CIENTO CINCUENTA Y CUATRO"
 */
function numberToSpanishWords(n: number): string {
  if (n === 0) return "CERO";

  const units = [
    "", "UNO", "DOS", "TRES", "CUATRO", "CINCO",
    "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE",
    "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS",
    "DIECISIETE", "DIECIOCHO", "DIECINUEVE"
  ];

  const tens = [
    "", "", "VEINTE", "TREINTA", "CUARENTA",
    "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"
  ];

  const hundreds = [
    "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS",
    "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS",
    "OCHOCIENTOS", "NOVECIENTOS"
  ];

  // Convierte números < 1000
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

  // Miles + resto
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;

  let res = "";
  if (thousands > 0) res += `${convertLessThan1000(thousands)} MIL `;
  if (rest > 0) res += convertLessThan1000(rest);

  return res.trim().toUpperCase();
}

/* ==========================================================
 *   Helper: Generar string del contrato
 * ========================================================== */
function formatContratoStr(contrato?: { fecha_inicio: Date; fecha_fin: Date }): string {
  if (!contrato) return "";
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    }).replace(/\//g, "-");

  return `${fmt(contrato.fecha_inicio)} a ${fmt(contrato.fecha_fin)}`;
}

/**
 * ==========================================================
 *             FUNCIÓN PRINCIPAL: generarExcelRendicion
 * ==========================================================
 *
 * Genera el archivo Excel EXACTO al modelo que enviaste
 * y que usa la inmobiliaria.
 *
 * Parámetros:
 * - numeroRendicion: nro correlativo
 * - fechaRendicion: "DD-MM-YYYY"
 * - cobranzas: array con todos los datos ya procesados
 * - ipcData: valores opcionales del IPC del mes
 * - saldoAnterior: saldo arrastrado de rendición previa
 *
 * Devuelve:
 * - Buffer del archivo .xlsx para descargar
 */
export async function generarExcelRendicion(
  numeroRendicion: string | number,
  fechaRendicion: string,
  cobranzas: CobranzaForExcel[],
  ipcData?: { mes: number | null; anio: number | null; valor: number | null },
  saldoAnterior?: number
): Promise<Buffer> {

  /* --------------------------------------------
   * Crear workbook (archivo) y preparar fecha
   * -------------------------------------------- */
  const workbook = new ExcelJS.Workbook();

  // Parseo "DD-MM-YYYY"
  const [day, month, year] = fechaRendicion.split("-").map(Number);
  const monthName = getMonthName(month);
  const shortYear = year.toString().substring(2);

  // Excel usa números de serie para fechas
  const date = new Date(year, month - 1, day);
  const dateSerial = Math.floor(date.getTime() / 86400000) + 25569;

  /* ==========================================================
   *               HOJA PRINCIPAL: "Rend XX-Mes YY"
   * ========================================================== */
  const sheetName = `Rend ${numeroRendicion}-${monthName} ${shortYear} `;
  const sheetR = workbook.addWorksheet(sheetName); //sheet -> hoja principal

  /* --------------------------------------------
   * Encabezado
   * -------------------------------------------- */

  // Row 1
  sheetR.getCell('B1').value = 'EP';

  // Row 2
  sheetR.getCell('B2').value = `Rendición Nº ${numeroRendicion}`;

  // Row 3
  sheetR.getCell('B3').value = `Período (${year}):`;
  sheetR.getCell('C3').value = monthName;

  // Row 4: empty

  // Row 5: Headers
  sheetR.getCell('B5').value = 'INGRESOS/ Detalle a Cobrar';
  sheetR.getCell('C5').value = 'Alquiler';
  sheetR.getCell('D5').value = 'Total a cobrar';
  sheetR.getCell('E5').value = 'Pago Efvo';
  sheetR.getCell('F5').value = 'TOTAL COBRADO';
  sheetR.getCell('G5').value = 'A cobrar';
  sheetR.getCell('H5').value = 'Aumento IPC c/ 3 meses';
  sheetR.getCell('J5').value = 'Contrato';

  // Row 6
  sheetR.getCell('H6').value = 'Link a aumentos IPC';

  // Filas de ingresos (empezando en row 7)
  let totalIngresos = 0;
  let totalAlquiler = 0;
  let totalSSAdm = 0; // Para calcular después
  let totalExpensas = 0; // Para expensas cobradas
  let totalCobrado = 0; // Total cobrado general
  cobranzas.forEach((c, index) => {
    const rowNum = 7 + index;
    const alquiler = c.monto;
    const totalCobrar = c.total_cobrar ?? alquiler; // Usar calculado o monto
    const pagoEfvo = 0; // Asumir 0 (no en schema, agregar si hay modelo PagoEfvo)
    const totalCobr = c.total_cobrado ?? (c.pagado ? totalCobrar : 0); // Basado en pagado
    const aCobrar = c.a_cobrar ?? (totalCobrar - totalCobr);
    const expensas = totalCobrar - alquiler; // Diferencia como expensas/cuotas
    totalIngresos += totalCobrar; // O usa aCobrar si prefieres pendiente
    totalAlquiler += alquiler;
    totalExpensas += expensas;
    totalCobrado += totalCobr;

    // ID en A
    sheetR.getCell(`A${rowNum}`).value = c.id_cobranza; // Usar id_cobranza real

    // Descripción completa en B (cliente + concepto + observaciones si hay)
    const desc = `${c.cliente.nombre}: ${c.concepto}${c.observaciones ? ` - ${c.observaciones}` : ''}`;
    sheetR.getCell(`B${rowNum}`).value = desc;

    // Alquiler en C
    sheetR.getCell(`C${rowNum}`).value = alquiler;
    sheetR.getCell(`C${rowNum}`).numFmt = '#,##0';

    // Total a cobrar en D
    sheetR.getCell(`D${rowNum}`).value = totalCobrar;
    sheetR.getCell(`D${rowNum}`).numFmt = '#,##0';

    // Pago Efvo en E (vacío por ahora)
    sheetR.getCell(`E${rowNum}`).value = pagoEfvo;
    sheetR.getCell(`E${rowNum}`).numFmt = '#,##0';

    // TOTAL COBRADO en F
    sheetR.getCell(`F${rowNum}`).value = totalCobr;
    sheetR.getCell(`F${rowNum}`).numFmt = '#,##0';

    // A cobrar en G
    sheetR.getCell(`G${rowNum}`).value = aCobrar;
    sheetR.getCell(`G${rowNum}`).numFmt = '#,##0';

    // Aumento IPC en H
    sheetR.getCell(`H${rowNum}`).value = c.ipcAumento ?? (ipcData?.valor ? `IPC ${ipcData.anio}` : '');

    // Link/Valor IPC en I
    if (c.ipcValor) {
      sheetR.getCell(`I${rowNum}`).value = c.ipcValor;
    }

    // Contrato en J (usar derivado)
    sheetR.getCell(`J${rowNum}`).value = c.contratoStr ?? '';

    // Bordes y formato básico para filas
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
      const cell = sheetR.getCell(`${col}${rowNum}`);
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  // Row total ingresos
  const totalIngresosRow = 7 + cobranzas.length;
  sheetR.getCell(`B${totalIngresosRow}`).value = 'TOTAL INGRESOS';
  sheetR.getCell(`D${totalIngresosRow}`).value = totalIngresos;
  sheetR.getCell(`D${totalIngresosRow}`).numFmt = '#,##0';
  sheetR.getCell(`F${totalIngresosRow}`).value = totalCobrado;
  sheetR.getCell(`G${totalIngresosRow}`).value = totalIngresos - totalCobrado; // Pendiente total
  sheetR.getCell(`G${totalIngresosRow}`).numFmt = '#,##0';

  // Sección EGRESOS
  const egresosStartRow = totalIngresosRow + 2;
  sheetR.getCell(`A${egresosStartRow}`).value = 'EGRESOS';

  // SS Adm 10%
  const ssAdmStartRow = egresosStartRow + 3;
  sheetR.getCell(`A${ssAdmStartRow}`).value = 'SS Adm 10%/Mensual/A cargo Propietario';

  let ssAdmRow = ssAdmStartRow + 1;
  // Una fila por cada
  cobranzas.forEach((c) => {
    const ssPorItem = c.monto * 0.1;
    totalSSAdm += ssPorItem;
    sheetR.getCell(`B${ssAdmRow}`).value = `${c.inmueble?.titulo ?? 'Inmueble'} 10% de ${c.monto}`; // Usar inmueble.titulo
    sheetR.getCell(`E${ssAdmRow}`).value = ssPorItem;
    sheetR.getCell(`E${ssAdmRow}`).numFmt = '#,##0.00';
    ssAdmRow++;
  });

  // Total SS Adm
  sheetR.getCell(`E${ssAdmRow}`).value = totalSSAdm;
  sheetR.getCell(`E${ssAdmRow}`).numFmt = '#,##0.00';

  // Expensas cobradas
  const expensasRow = ssAdmRow + 3;
  sheetR.getCell(`A${expensasRow}`).value = 'SS Adm Cobrado a Inquilinos en ingresos';
  sheetR.getCell(`A${expensasRow + 1}`).value = 'Expensas cobradas a inquilinos';
  sheetR.getCell(`E${expensasRow + 1}`).value = totalExpensas; // Calculado de diferencias
  sheetR.getCell(`E${expensasRow + 1}`).numFmt = '#,##0';

  // Gtos Mantenimiento (placeholder, agregar modelo si existe)
  const gtosMRow = expensasRow + 5;
  sheetR.getCell(`A${gtosMRow}`).value = 'Gtos Mantenimiento (CON COMISIÓN DEL 10%)';
  // Filas vacías con 0 en E (ajustar si hay Historial o pagos relacionados)
  for (let i = 0; i < 6; i++) {
    sheetR.getCell(`E${gtosMRow + i + 1}`).value = 0;
  }
  sheetR.getCell(`E${gtosMRow + 7}`).value = 0; // 10% Adm = 0

  // Impuestos - Servicios (placeholder, fijos como sample; agregar modelo Egreso si se expande schema)
  const impRow = gtosMRow + 9;
  sheetR.getCell(`A${impRow}`).value = 'Impuestos - Servicios y Pagos a cuenta (SIN COMISIÓN DEL 10%)';
  // Valores fijos (reemplazar con query a nuevo modelo si se agrega)
  sheetR.getCell(`A${impRow + 1}`).value = 'Seguro Sep y Oct 26.755 / 8 x 4 x 2 meses';
  sheetR.getCell(`E${impRow + 1}`).value = 26755;
  sheetR.getCell(`A${impRow + 3}`).value = 'TV OC CITY FC 2579-00008163';
  sheetR.getCell(`E${impRow + 3}`).value = 510000;
  const totalImpuestos = 26755 + 19987.65 + 510000;
  sheetR.getCell(`E${impRow + 6}`).value = totalImpuestos;
  sheetR.getCell(`E${impRow + 6}`).numFmt = '#,##0.00';

  // Total Egresos (SS + Expensas + Gtos(0) + Impuestos)
  const totalEgresos = totalSSAdm + totalExpensas + totalImpuestos;
  const totalEgrRow = impRow + 8;
  sheetR.getCell(`B${totalEgrRow}`).value = 'TOTAL EGRESOS';
  sheetR.getCell(`E${totalEgrRow}`).value = totalEgresos;
  sheetR.getCell(`F${totalEgrRow}`).value = totalEgresos;
  sheetR.getCell(`E${totalEgrRow}`).numFmt = '#,##0.00';

  // Saldo anterior (usar param)
  const sdoAnt = saldoAnterior ?? 386953; // Default sample
  const sdoAntRow = totalEgrRow + 1;
  sheetR.getCell(`E${sdoAntRow}`).value = sdoAnt;
  sheetR.getCell(`E${sdoAntRow}`).numFmt = '#,##0';

  // Saldo final
  const saldoFinal = totalCobrado - totalEgresos + sdoAnt; // Ajustado con totalCobrado
  const saldoFinalRow = sdoAntRow + 1;
  sheetR.getCell(`C${saldoFinalRow}`).value = `SALDO FINAL  ${day}-${monthName.substring(0,3)}-${shortYear}`;
  sheetR.getCell(`D${saldoFinalRow}`).value = saldoFinal;
  sheetR.getCell(`D${saldoFinalRow}`).numFmt = '#,##0.00';

  // Firma
  const firmaRow = saldoFinalRow + 1;
  sheetR.getCell(`A${firmaRow}`).value = 'Firma: ………………………………………………………………………………………..';

  // Formato general para headers y totals
  [5, totalIngresosRow, ssAdmStartRow, expensasRow, gtosMRow, impRow, totalEgrRow, sdoAntRow, saldoFinalRow].forEach(r => {
    sheetR.getRow(r).font = { bold: true };
  });

  // =============================================================
  //                     HOJA RECIBOS
  // =============================================================
  const sheetRec = workbook.addWorksheet('RECIBOS ');

  // Columnas anchas
  sheetRec.columns = [
    { width: 20 }, { width: 40 }, { width: 10 }, { width: 10 },
    { width: 20 }, { width: 40 }, { width: 10 }, { width: 10 }
  ];

  let currentRow = 1;
  const recibos = cobranzas;

  recibos.forEach((c) => {
    const total = c.total_cobrar ?? c.monto;
    const spelled = numberToSpanishWords(total);
    const unFunc = c.unFuncional ?? 
      (c.inmueble ? `${c.inmueble.ubicacion.direccion}: ${c.inmueble.titulo}` : 'UNIDAD FUNCIONAL');

    // RECIBO ORIGINAL (A-D)
    sheetRec.getCell(`A${currentRow}`).value = 'RECIBO ORIGINAL';
    sheetRec.getCell(`A${currentRow}`).font = { bold: true };

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'IMPORTE';
    sheetRec.getCell(`C${currentRow}`).value = total;
    sheetRec.getCell(`C${currentRow}`).numFmt = '#,##0';

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'UN. FUNCIONAL:';
    sheetRec.getCell(`B${currentRow}`).value = unFunc.toUpperCase();

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'RECIBÍ DE';
    sheetRec.getCell(`B${currentRow}`).value = c.cliente.nombre.toUpperCase();

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'CONCEPTO DE PAGO';
    sheetRec.getCell(`B${currentRow}`).value = `${c.cliente.nombre}: ${c.concepto}${c.observaciones ? ` - ${c.observaciones}` : ''}`;

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'TOTAL A PAGAR: ';
    sheetRec.getCell(`B${currentRow}`).value = spelled;

    currentRow++; // Blank

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'Firma Administración-Por cta propietario';

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'Fecha';
    sheetRec.getCell(`B${currentRow}`).value = dateSerial;
    sheetRec.getCell(`B${currentRow}`).numFmt = 'dd/mm/yyyy';

    currentRow++;
    sheetRec.getCell(`A${currentRow}`).value = 'Forma de pago: ';
    sheetRec.getCell(`C${currentRow}`).value = `Rend. Nº ${numeroRendicion}`;
    if (c.numero_recibo) {
      sheetRec.getCell(`D${currentRow}`).value = c.numero_recibo; // Agregar número recibo
    }

    // RECIBO DUPLICADO (E-H, mirror)
    const dupRowStart = currentRow - 9;
    sheetRec.getCell(`E${dupRowStart}`).value = 'RECIBO DUPLICADO';
    sheetRec.getCell(`E${dupRowStart}`).font = { bold: true };

    sheetRec.getCell(`E${dupRowStart + 1}`).value = 'IMPORTE';
    sheetRec.getCell(`G${dupRowStart + 1}`).value = total;
    sheetRec.getCell(`G${dupRowStart + 1}`).numFmt = '#,##0';

    sheetRec.getCell(`E${dupRowStart + 2}`).value = 'UN. FUNCIONAL:';
    sheetRec.getCell(`F${dupRowStart + 2}`).value = unFunc.toUpperCase();

    sheetRec.getCell(`E${dupRowStart + 3}`).value = 'RECIBÍ DE';
    sheetRec.getCell(`F${dupRowStart + 3}`).value = c.cliente.nombre.toUpperCase();

    sheetRec.getCell(`E${dupRowStart + 4}`).value = 'CONCEPTO DE PAGO';
    sheetRec.getCell(`F${dupRowStart + 4}`).value = `${c.cliente.nombre}: ${c.concepto}${c.observaciones ? ` - ${c.observaciones}` : ''}`;

    sheetRec.getCell(`E${dupRowStart + 5}`).value = 'TOTAL A PAGAR: ';
    sheetRec.getCell(`F${dupRowStart + 5}`).value = spelled;

    sheetRec.getCell(`E${dupRowStart + 7}`).value = 'Firma Administración-Por cta propietario';

    sheetRec.getCell(`E${dupRowStart + 8}`).value = 'Fecha';
    sheetRec.getCell(`F${dupRowStart + 8}`).value = dateSerial;
    sheetRec.getCell(`F${dupRowStart + 8}`).numFmt = 'dd/mm/yyyy';

    sheetRec.getCell(`E${dupRowStart + 9}`).value = 'Forma de pago: ';
    sheetRec.getCell(`G${dupRowStart + 9}`).value = `Rend. Nº ${numeroRendicion}`;
    if (c.numero_recibo) {
      sheetRec.getCell(`H${dupRowStart + 9}`).value = c.numero_recibo;
    }

    currentRow += 2; // Espacio
  });

  // =============================================================
  // GENERAR BUFFER
  // =============================================================
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}