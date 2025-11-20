"use server";

import { db } from "@/lib/db";

export async function getEstadosPago() {
  try {
    return await db.estadoPago.findMany({
      orderBy: { nombre: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener estados de pago:", error);
    throw new Error("No se pudieron obtener los estados de pago");
  }
}