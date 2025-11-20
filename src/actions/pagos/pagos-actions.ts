/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/actions/pagos/pagos-actions.ts
// Descripción: Acciones CRUD para pagos usando Prisma
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use server";

import { db } from "@/lib/db";

// -----------------------------------------------
// FIX: función para convertir Decimal → number
// -----------------------------------------------
function serialize(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "object" &&
      value !== null &&
      typeof value.toNumber === "function"
        ? value.toNumber()
        : value
    )
  );
}

// =======================
// OBTENER TODOS LOS PAGOS
// =======================
export async function getPagos() {
  try {
    const pagos = await db.pagoProveedor.findMany({
      include: {
        proveedor: true,
        medioPago: true,
        estadoPago: true,
      },
      orderBy: { id_pago: "desc" },
    });

    return serialize(pagos); // ← FIX
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
}

// =======================
// OBTENER PAGO POR ID
// =======================
export async function getPagoById(id_pago: number) {
  try {
    const pago = await db.pagoProveedor.findUnique({
      where: { id_pago },
      include: {
        proveedor: true,
        medioPago: true,
        estadoPago: true,
      },
    });

    return serialize(pago); // ← FIX
  } catch (error) {
    console.error("Error al obtener pago:", error);
    return null;
  }
}

// =======================
// CREAR PAGO
// =======================
export async function createPago(data: any) {
  try {
    const pago = await db.pagoProveedor.create({
      data: {
        proveedorId: Number(data.proveedorId),
        medioPagoId: Number(data.medioPagoId),
        estadoPagoId: Number(data.estadoPagoId),
        concepto: data.concepto,
        importe: Number(data.importe), // Decimal válido
        fecha_pago: new Date(data.fecha_pago),
        comprobante: data.comprobante || null,
        responsable: data.responsable,
      },
    });

    return { success: true, pago: serialize(pago) };
  } catch (error) {
    console.error("Error al crear pago:", error);
    return { success: false, message: "No se pudo crear el pago" };
  }
}

// =======================
// ACTUALIZAR PAGO
// =======================
export async function updatePago(id_pago: number, data: any) {
  try {
    const pago = await db.pagoProveedor.update({
      where: { id_pago },
      data: {
        concepto: data.concepto,
        importe: Number(data.importe),
        medioPagoId: Number(data.medioPagoId),
        estadoPagoId: Number(data.estadoPagoId),
        comprobante: data.comprobante || null,
        responsable: data.responsable,
        fecha_pago: data.fecha_pago ? new Date(data.fecha_pago) : undefined,
      },
    });

    return { success: true, pago: serialize(pago) };
  } catch (error) {
    console.error("Error al actualizar pago:", error);
    return { success: false, message: "No se pudo actualizar el pago" };
  }
}

// =======================
// ELIMINAR PAGO
// =======================
export async function deletePago(id_pago: number) {
  try {
    await db.pagoProveedor.delete({
      where: { id_pago },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return { success: false, message: "No se pudo eliminar el pago" };
  }
}