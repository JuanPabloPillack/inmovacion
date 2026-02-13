"use server";

import { db } from "@/lib/db";

export async function getClientes() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { id_cliente: "desc" },
      include: {
        tiposCliente: {
          include: {
            tipoCliente: true,
          },
        },
        tipoDocumento: true,
      },
    });

    return clientes;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw new Error("No se pudieron cargar los clientes");
  }
}
