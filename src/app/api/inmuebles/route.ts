import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InmuebleDTO } from "@/types/inmuebles";

export const GET = async () => {
  try {
    const rows = await prisma.inmueble.findMany({
      include: {
        tipo_inmueble: true,
        ubicacion: {
          include: { barrio: { include: { localidad: true } } },
        },
        imagenes: true,
      },
    });

    const data: InmuebleDTO[] = rows.map((i) => {
      // 1) Mapeo de imágenes (agrego principal con fallback false)
      const imagenes = i.imagenes.map((img) => ({
        id: img.id,
        url: img.url,
        inmuebleId: img.inmuebleId,
        principal: (img as unknown as { principal?: boolean }).principal ?? false,
      }));

      // 2) Foto principal a partir del array ya tipado
      const fotoPrincipal =
        imagenes.find((img) => img.principal)?.url ||
        i.foto ||
        "/placeholder.jpg";

      // 3) Ubicación: forzar ciudad/provincia/id_barrio a null si no vienen tipadas
      type UbicacionMaybe = typeof i.ubicacion & {
        ciudad?: string | null;
        provincia?: string | null;
        id_barrio?: number | null;
      };
      const u = i.ubicacion as UbicacionMaybe;

      return {
        id_inmueble: i.id_inmueble,
        id_tipo_inmueble: i.id_tipo_inmueble,
        id_ubicacion: i.id_ubicacion,
        id_estado: i.id_estado,
        id_cliente: i.id_cliente,
        precio: i.precio.toNumber(),
        superficie_total: i.superficie_total.toNumber(),
        superficie_cubierta: i.superficie_cubierta?.toNumber() ?? null,
        cantidad_ambientes: i.cantidad_ambientes ?? null,
        antiguedad: i.antiguedad ?? null,
        foto: i.foto ?? null,
        fotoPrincipal,
        detalles: i.detalles ?? null,
        tipo_inmueble: {
          id_tipo_inmueble: i.tipo_inmueble.id_tipo_inmueble,
          nombre: i.tipo_inmueble.nombre,
        },
        ubicacion: {
          id_ubicacion: i.ubicacion.id_ubicacion,
          direccion: i.ubicacion.direccion,
          ciudad: u.ciudad ?? null,
          provincia: u.provincia ?? null,
          id_barrio: u.id_barrio ?? null,
          barrio: u.barrio
            ? {
                id_barrio: u.barrio.id_barrio,
                nombre: u.barrio.nombre,
                id_localidad: u.barrio.id_localidad,
                localidad: {
                  id_localidad: u.barrio.localidad.id_localidad,
                  nombre: u.barrio.localidad.nombre,
                },
              }
            : null,
        },
        imagenes,
      } satisfies InmuebleDTO;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener inmuebles:", error);
    return NextResponse.json(
      { error: "Error al obtener inmuebles" },
      { status: 500 }
    );
  }
};

// (Opcional) Si usas el POST para agregar imagen desde la Card:
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    if (body?.action === "addImage") {
      const { inmuebleId, url } = body;
      if (!inmuebleId || !url) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      await prisma.inmuebleImagen.create({
        data: {
          inmuebleId: Number(inmuebleId),
          url: String(url),
          // si quieres marcar como principal automáticamente cuando no haya una
          // principal: false,
        },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (error) {
    console.error("Error en POST /api/inmuebles:", error);
    return NextResponse.json(
      { error: "Error en la operación" },
      { status: 500 }
    );
  }
};
