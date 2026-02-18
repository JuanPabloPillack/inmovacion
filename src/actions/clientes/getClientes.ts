"use server";

import { db } from "@/lib/db";

export async function getClientes() {

  const clientes = await db.cliente.findMany({

    orderBy: {
      id_cliente: "desc"
    },

    include: {

      tiposCliente: {
        include: {
          tipoCliente: true
        }
      },

      tipoDocumento: true

    }

  });

  return clientes.map(cliente => ({

    ...cliente,

    tiposCliente: cliente.tiposCliente
      .filter(tc => tc.tipoCliente) // evita undefined
      .map(tc => tc.tipoCliente),

    tipoClienteIds: cliente.tiposCliente
      .filter(tc => tc.tipoCliente)
      .map(tc => tc.tipoClienteId)

  }));

}
