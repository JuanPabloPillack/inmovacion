// ===============================================
// Archivo: src/actions/proveedores/proveedor-actions.ts
// Descripción: Acciones CRUD para proveedores usando db
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use server";

import { db } from "@/lib/db";

// =======================
// CREAR PROVEEDOR
// =======================
export async function createProveedor(data: {
  nombre_razon_social: string;
  cuit_cuil: string;
  correo_contacto?: string;
  telefono_contacto?: string;
  direccion?: string;
  tipoServicioId: number;
  datos_bancarios?: string;
  observaciones?: string;
}) {
  try {
    const proveedor = await db.proveedor.create({
      data: {
        ...data,
        estado: true, // siempre activo al crear
      },
    });

    return { success: true, proveedor };
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    throw new Error("No se pudo crear el proveedor");
  }
}

// =======================
// ACTUALIZAR PROVEEDOR
// =======================
export async function updateProveedor(id_proveedor: number, data: any) {
  try {
    const proveedor = await db.proveedor.update({
      where: { id_proveedor },
      data,
    });

    return { success: true, proveedor };
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    throw new Error("No se pudo actualizar el proveedor");
  }
}

// =======================
// SOFT DELETE (estado = false)
// =======================
export async function softDeleteProveedor(id_proveedor: number) {
  try {
    await db.proveedor.update({
      where: { id_proveedor },
      data: { estado: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al realizar soft delete:", error);
    throw new Error("No se pudo eliminar el proveedor");
  }
}

// =======================
// ACTIVAR PROVEEDOR (estado = true)
// =======================
export async function activateProveedor(id_proveedor: number) {
  try {
    await db.proveedor.update({
      where: { id_proveedor },
      data: { estado: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al activar proveedor:", error);
    throw new Error("No se pudo activar el proveedor");
  }
}

// =======================
// OBTENER PROVEEDOR POR ID
// =======================
export async function getProveedorById(id_proveedor: number) {
  try {
    const proveedor = await db.proveedor.findUnique({
      where: { id_proveedor },
      include: {
        tipoServicio: true,
      },
    });

    return proveedor;
  } catch (error) {
    console.error("Error al obtener proveedor:", error);
    throw new Error("No se pudo obtener el proveedor");
  }
}
