/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/inmuebles/modificar/[id]/route.ts
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

    // ✅ Validación segura para números y Decimal
    const parseDecimal = (value: FormDataEntryValue | null) => {
      const num = Number(value);
      return !isNaN(num) ? new Prisma.Decimal(num) : undefined;
    };
    const parseNumber = (value: FormDataEntryValue | null) => {
      const num = Number(value);
      return !isNaN(num) ? num : undefined;
    };

    const precio = parseDecimal(formData.get("precio"));
    const superficie_total = parseDecimal(formData.get("superficie_total"));
    const superficie_cubierta = parseDecimal(formData.get("superficie_cubierta"));
    const cantidad_ambientes = parseNumber(formData.get("cantidad_ambientes"));
    const cantidad_banos = parseNumber(formData.get("cantidad_banos"));
    const cantidad_dormitorios = parseNumber(formData.get("cantidad_dormitorios"));
    const cantidad_cocheras = parseNumber(formData.get("cantidad_cocheras"));
    const cantidad_pisos = parseNumber(formData.get("cantidad_pisos"));
    const antiguedad = parseNumber(formData.get("antiguedad"));
    const detalles = formData.get("detalles")?.toString().trim() || "";

    const id_estado = parseNumber(formData.get("id_estado"));
    const id_tipo_inmueble = parseNumber(formData.get("id_tipo_inmueble"));
    const id_operacion = parseNumber(formData.get("id_operacion"));
    const id_cliente = parseNumber(formData.get("id_cliente"));
    const id_barrio = parseNumber(formData.get("id_barrio"));

    // 📍 Ubicación
    const direccion = formData.get("direccion")?.toString().trim() || "";
    const ciudad = formData.get("ciudad")?.toString().trim() || "";
    const provincia = formData.get("provincia")?.toString().trim() || "";

    // 📸 Imágenes
    const files = (formData.getAll("imagenes") as File[]).filter(f => f instanceof File && f.name);
    const principalIndex = Number(formData.get("principalIndex")) || 0;

    // 🔍 Buscar inmueble existente
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: { ubicacion: true },
    });
    if (!inmueble) return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });

    // Validar relaciones
    const relaciones = [
      { id: id_estado, model: "estado", name: "Estado" },
      { id: id_tipo_inmueble, model: "tipo_inmueble", name: "Tipo de inmueble" },
      { id: id_operacion, model: "operacion", name: "Operación" },
      { id: id_cliente, model: "cliente", name: "Cliente" },
      { id: id_barrio, model: "barrio", name: "Barrio" },
    ];
    for (const rel of relaciones) {
      if (rel.id) {
        const exists = await (db as any)[rel.model].findUnique({ where: { [`id_${rel.model}`]: rel.id } });
        if (!exists) return NextResponse.json({ error: `${rel.name} inválido` }, { status: 400 });
      }
    }

    // 📍 Actualizar o crear ubicación
    if (inmueble.ubicacion) {
      await db.ubicacion.update({
        where: { id_ubicacion: inmueble.ubicacion.id_ubicacion },
        data: { direccion, ciudad, provincia, id_barrio },
      });
    } else {
      const nuevaUbicacion = await db.ubicacion.create({ data: { direccion, ciudad, provincia, id_barrio } });
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
