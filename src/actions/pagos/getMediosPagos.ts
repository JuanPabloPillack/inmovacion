// src/actions/pagos/getMediosPagos.ts
"use server";

import { db } from "@/lib/db";

export async function getMediosPago() {
  try {
    return await db.medioPago.findMany({
      orderBy: { nombre: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener medios de pago:", error);
    throw new Error("No se pudieron obtener los medios de pago");
  }
}