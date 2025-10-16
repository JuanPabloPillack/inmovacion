import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const formData = await req.formData();

    // 🏡 Campos básicos del inmueble
    const titulo = formData.get("titulo")?.toString().trim();
    if (!titulo) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });

    const precio = formData.get("precio") ? new Prisma.Decimal(Number(formData.get("precio"))) : undefined;
    const superficie_total = formData.get("superficie_total")
      ? new Prisma.Decimal(Number(formData.get("superficie_total")))
      : undefined;
    const superficie_cubierta = formData.get("superficie_cubierta")
      ? new Prisma.Decimal(Number(formData.get("superficie_cubierta")))
      : undefined;
    const cantidad_ambientes = formData.get("cantidad_ambientes") ? Number(formData.get("cantidad_ambientes")) : undefined;
    const cantidad_banos = formData.get("cantidad_banos") ? Number(formData.get("cantidad_banos")) : undefined;
    const cantidad_dormitorios = formData.get("cantidad_dormitorios") ? Number(formData.get("cantidad_dormitorios")) : undefined;
    const cantidad_cocheras = formData.get("cantidad_cocheras") ? Number(formData.get("cantidad_cocheras")) : undefined;
    const cantidad_pisos = formData.get("cantidad_pisos") ? Number(formData.get("cantidad_pisos")) : undefined;
    const antiguedad = formData.get("antiguedad") ? Number(formData.get("antiguedad")) : undefined;
    const detalles = formData.get("detalles")?.toString().trim() || "";

    const id_estado = formData.get("id_estado") ? Number(formData.get("id_estado")) : undefined;
    const id_tipo_inmueble = formData.get("id_tipo_inmueble") ? Number(formData.get("id_tipo_inmueble")) : undefined;
    const id_operacion = formData.get("id_operacion") ? Number(formData.get("id_operacion")) : undefined;
    const id_cliente = formData.get("id_cliente") ? Number(formData.get("id_cliente")) : undefined;

    // 📍 Ubicación
    const direccion = formData.get("direccion")?.toString().trim() || "";
    const ciudad = formData.get("ciudad")?.toString().trim() || "";
    const provincia = formData.get("provincia")?.toString().trim() || "";
    const id_barrio = formData.get("id_barrio") ? Number(formData.get("id_barrio")) : undefined;

    // 📸 Imágenes
    const files = formData.getAll("imagenes") as File[];
    const principalIndex = Number(formData.get("principalIndex")) || 0;

    // 🔍 Buscar inmueble existente
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: { ubicacion: true },
    });

    if (!inmueble) return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });

    // Validar relaciones
    if (id_estado && !(await db.estado.findUnique({ where: { id_estado } })))
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    if (id_tipo_inmueble && !(await db.tipo_inmueble.findUnique({ where: { id_tipo_inmueble } })))
      return NextResponse.json({ error: "Tipo de inmueble inválido" }, { status: 400 });
    if (id_operacion && !(await db.operacion.findUnique({ where: { id_operacion } })))
      return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
    if (id_cliente && !(await db.cliente.findUnique({ where: { id_cliente } })))
      return NextResponse.json({ error: "Cliente inválido" }, { status: 400 });
    if (id_barrio && !(await db.barrio.findUnique({ where: { id_barrio } })))
      return NextResponse.json({ error: "Barrio inválido" }, { status: 400 });

    // 📍 Actualizar o crear ubicación
    if (inmueble.ubicacion) {
      await db.ubicacion.update({
        where: { id_ubicacion: inmueble.ubicacion.id_ubicacion },
        data: {
          direccion,
          ciudad,
          provincia,
          id_barrio,
        },
      });
    } else {
      const nuevaUbicacion = await db.ubicacion.create({
        data: { direccion, ciudad, provincia, id_barrio },
      });
      await db.inmueble.update({ where: { id_inmueble: id }, data: { id_ubicacion: nuevaUbicacion.id_ubicacion } });
    }

    // 🏠 Actualizar inmueble
    await db.inmueble.update({
      where: { id_inmueble: id },
      data: {
        titulo,
        precio,
        superficie_total,
        superficie_cubierta,
        cantidad_ambientes,
        cantidad_banos,
        cantidad_dormitorios,
        cantidad_cocheras,
        cantidad_pisos,
        antiguedad,
        detalles,
        id_estado,
        id_tipo_inmueble,
        id_operacion,
        id_cliente,
      },
    });

    // 🖼️ Actualizar imágenes
    if (files.length > 0) {
      await db.inmuebleImagen.deleteMany({ where: { inmuebleId: id } });

      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!(file instanceof File) || !file.name) continue;

        const ext = path.extname(file.name);
        const fileName = `${randomUUID()}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(path.join(uploadDir, fileName), buffer);

        await db.inmuebleImagen.create({
          data: { url: `/uploads/${fileName}`, inmuebleId: id, principal: i === principalIndex },
        });
      }
    }

    // 📤 Retornar inmueble actualizado con relaciones
    const inmuebleActualizado = await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: {
        cliente: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
        tipo_inmueble: true,
        estado: true,
        operacion: true,
      },
    });

    return NextResponse.json({ message: "✅ Inmueble actualizado correctamente", inmueble: inmuebleActualizado });
  } catch (error) {
    console.error("❌ Error al actualizar inmueble:", error);
    return NextResponse.json({ error: "Error al actualizar el inmueble", detalle: String(error) }, { status: 500 });
  }
}
