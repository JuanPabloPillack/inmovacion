import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InmuebleDTO } from "@/types/inmuebles";
import type {
  Inmueble as PrismaInmueble,
  InmuebleImagen as PrismaInmuebleImagen,
  Tipo_inmueble as PrismaTipo,
  Ubicacion as PrismaUbicacion,
  Barrio as PrismaBarrio,
  Localidad as PrismaLocalidad,
} from "@prisma/client";

type InmuebleWithRelations = PrismaInmueble & {
  tipo_inmueble: PrismaTipo;
  ubicacion: PrismaUbicacion & {
    barrio?: PrismaBarrio & { localidad?: PrismaLocalidad } | null;
  };
  imagenes: PrismaInmuebleImagen[];
};

export const GET = async () => {
  try {
    const rows = (await prisma.inmueble.findMany({
      include: {
        tipo_inmueble: true,
        ubicacion: {
          include: {
            barrio: {
              include: { localidad: true },
            },
          },
        },
        imagenes: true,
      },
    })) as InmuebleWithRelations[];

    const data: InmuebleDTO[] = rows.map((i) => {
      // mapeo de imágenes con tipado seguro
      const imagenes = (i.imagenes || []).map((img) => ({
        id: img.id,
        url: img.url,
        inmuebleId: img.inmuebleId,
        principal: Boolean(img.principal),
      }));

      const fotoPrincipal = imagenes.find((img) => img.principal)?.url || i.foto || "/placeholder.jpg";

      const ubicacion = {
        id_ubicacion: i.ubicacion.id_ubicacion,
        direccion: i.ubicacion.direccion,
        ciudad: i.ubicacion?.barrio?.localidad?.nombre ?? null,
        provincia: null,
        id_barrio: i.ubicacion.id_barrio ?? null,
        barrio: i.ubicacion.barrio
          ? {
              id_barrio: i.ubicacion.barrio.id_barrio,
              nombre: i.ubicacion.barrio.nombre,
              id_localidad: i.ubicacion.barrio.id_localidad,
              localidad: {
                id_localidad: i.ubicacion.barrio.localidad?.id_localidad ?? 0,
                nombre: i.ubicacion.barrio.localidad?.nombre ?? "",
              },
            }
          : null,
      };

      const dto: InmuebleDTO = {
        id_inmueble: i.id_inmueble,
        id_tipo_inmueble: i.id_tipo_inmueble,
        id_ubicacion: i.id_ubicacion,
        id_estado: i.id_estado,
        id_cliente: i.id_cliente,
        precio: Number(i.precio),
        superficie_total: Number(i.superficie_total),
        superficie_cubierta: i.superficie_cubierta != null ? Number(i.superficie_cubierta) : null,
        cantidad_ambientes: i.cantidad_ambientes ?? null,
        antiguedad: i.antiguedad ?? null,
        foto: i.foto ?? null,
        fotoPrincipal,
        detalles: i.detalles ?? null,
        tipo_inmueble: {
          id_tipo_inmueble: i.tipo_inmueble.id_tipo_inmueble,
          nombre: i.tipo_inmueble.nombre,
        },
        ubicacion,
        imagenes,
      };

      return dto;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
};
