// ===============================================
// Archivo: src/actions/clientes/getClientes.ts
// Descripción: Obtener todos los clientes con tipoCliente
// ===============================================

"use server";

import { db } from "@/lib/db";

export async function getClientes() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { id_cliente: "desc" },
      include: {
        tipoCliente: true,
      },
    });

    return clientes;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw new Error("No se pudieron cargar los clientes");
  }
}
