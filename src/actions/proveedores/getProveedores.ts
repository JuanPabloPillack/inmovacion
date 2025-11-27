//src/actions/proveedores/getProveedores.ts

'use server';

import { db } from "@/lib/db";

// ========================================================
// Obtener proveedores — SOLO ACTIVOS
// ========================================================
export async function getProveedores() {
  try {
    const proveedores = await db.proveedor.findMany({
      where: { estado: true },  // 👈 SOLO ACTIVOS
      include: {
        tipoServicio: true,
      },
      orderBy: {
        id_proveedor: "desc",
      },
    });

    return proveedores;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    throw new Error("No se pudieron obtener los proveedores");
  }
}
