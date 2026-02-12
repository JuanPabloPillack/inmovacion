// src/actions/clientes/getTiposDocumento.ts
"use server";

import { db } from "@/lib/db";

export async function getTiposDocumento() {
  try {
    return await db.tipoDocumento.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id_tipo_documento: true,
        nombre: true,
        descripcion: true, // 👈 IMPORTANTE
      },
    });
  } catch (error) {
    console.error("Error cargando tipos de documento:", error);
    throw new Error("No se pudo cargar lista de tipos de documento.");
  }
}
