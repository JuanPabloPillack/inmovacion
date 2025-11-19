// ===============================================
// Archivo: src/actions/servicios/getTiposServicio.ts
// Descripción: Obtener todos los tipos de servicio
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use server";

import { db } from "@/lib/db";

export async function getTiposServicio() {
  try {
    const tipos = await db.tipoServicio.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return tipos;
  } catch (error) {
    console.error("Error al obtener tipos de servicio:", error);
    throw new Error("No se pudieron obtener los tipos de servicio");
  }
}
