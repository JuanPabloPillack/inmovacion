// =============================================================
// Acción: obtener lista de tipoCliente desde server action
// =============================================================

"use server";

import { db } from "@/lib/db";

export async function getTipoClientes() {
  try {
    return await db.tipoCliente.findMany({
      orderBy: { nombre: "asc" },
    });
  } catch (error) {
    console.error("Error cargando tipoCliente:", error);
    throw new Error("No se pudo cargar lista de tipos de cliente.");
  }
}
