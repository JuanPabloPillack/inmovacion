/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// src/actions/pagos/validaciones.ts
// VALIDACIONES PARA PAGOS A PROVEEDORES
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

// =============================
// VALIDAR CONCEPTO
// =============================
export function validateConcepto(concepto?: any) {
  if (concepto === undefined || concepto === null)
    return "El concepto es obligatorio.";

  const texto = String(concepto).trim();
  if (texto.length === 0) return "El concepto es obligatorio.";
  if (texto.length > 150) return "El concepto no puede superar los 150 caracteres.";

  // Letras, números, espacios, punto, coma y guiones
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/;
  if (!regex.test(texto)) return "El concepto contiene caracteres inválidos.";

  return null;
}

// =============================
// VALIDAR MONTO
// =============================
export function validateMonto(monto?: any) {
  if (monto === undefined || monto === null)
    return "El monto es obligatorio.";

  const texto = String(monto).trim();

  if (texto.length === 0) return "El monto es obligatorio.";
  if (texto.length > 150) return "El monto es demasiado largo.";

  // Solo números y un punto decimal (NO comas)
  const regex = /^[0-9]+(\.[0-9]+)?$/;
  if (!regex.test(texto))
    return "Formato inválido (use punto como separador decimal y solo números).";

  if (parseFloat(texto) <= 0)
    return "El monto debe ser mayor que cero.";

  return null;
}

// =============================
// VALIDAR RESPONSABLE
// =============================
export function validateResponsable(responsable?: any) {
  if (responsable === undefined || responsable === null)
    return "El responsable es obligatorio.";

  const texto = String(responsable).trim();

  if (texto.length < 3) return "Debe tener mínimo 3 caracteres.";
  if (texto.length > 80) return "Máximo 80 caracteres.";
  if (/\s{2,}/.test(texto)) return "No se permiten doble espacios.";

  // Solo letras y espacios
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  if (!regex.test(texto))
    return "El responsable solo puede contener letras y espacios.";

  return null;
}

// =============================
// VALIDAR COMPROBANTE
// =============================
export function validateComprobante(comprobante?: any) {
  if (comprobante === undefined || comprobante === null || comprobante === "")
    return null; // Opcional

  const texto = String(comprobante).trim();

  if (texto.length > 150) return "Máximo 150 caracteres.";

  // Permitir letras/números/espacios/punto/coma/guiones/slash
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\/._#,-]*$/;
  if (!regex.test(texto))
    return "El comprobante contiene caracteres inválidos.";

  return null;
}
