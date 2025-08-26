/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export async function obtenerInmuebles(filtros: any) {
  return prisma.inmueble.findMany({
    where: {
      localidad: filtros.localidad || undefined,
      tipo: filtros.tipo || undefined,
      precio: {
        gte: filtros.precioMin ? Number(filtros.precioMin) : undefined,
        lte: filtros.precioMax ? Number(filtros.precioMax) : undefined,
      },
    },
    select: {
      id_inmueble: true,
      tipo: true,
      precio: true,
      localidad: true,
    },
  });
}
