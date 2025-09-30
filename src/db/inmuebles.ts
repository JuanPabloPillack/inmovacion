/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";

export async function obtenerInmuebles(filtros: any) {
  return db.inmueble.findMany({
    where: {
      tipo_inmueble: {
        nombre: filtros.tipo || undefined, // Filtra por el nombre del tipo de inmueble
      },
      // Filtrar por localidad (a través de Ubicacion y Barrio)
      ubicacion: {
        barrio: {
          localidad: {
            nombre: filtros.localidad || undefined, // Filtra por el nombre de la localidad
          },
        },
      },
      precio: {
        gte: filtros.precioMin ? Number(filtros.precioMin) : undefined,
        lte: filtros.precioMax ? Number(filtros.precioMax) : undefined,
      },
    },
    select: {
      id_inmueble: true,
      precio: true,
      // Incluir la relación con Tipo_inmueble para obtener el nombre del tipo
      tipo_inmueble: {
        select: {
          nombre: true, // Esto representa el campo "tipo"
        },
      },
      // Incluir la relación con Ubicacion y Barrio para obtener la localidad
      ubicacion: {
        select: {
          barrio: {
            select: {
              localidad: {
                select: {
                  nombre: true, // Esto representa el campo "localidad"
                },
              },
            },
          },
        },
      },
    },
  });
}