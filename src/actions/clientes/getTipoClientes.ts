"use server";

import { db } from "@/lib/db";

export async function getTipoClientes() {
  try {
    const tipos = await db.tipoCliente.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id_tipo_cliente: true,
        nombre: true,
      },
    });

    return tipos;
  } catch (error) {
    console.error("Error cargando tipoCliente:", error);
    throw new Error("No se pudo cargar lista de tipos de cliente.");
  }
}
