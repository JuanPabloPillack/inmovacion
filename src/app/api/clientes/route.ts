import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==================== GET ====================
export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { id_cliente: "desc" },
      include: { tipoCliente: true },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

// ==================== POST (Crear) ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ==== Validaciones ====
    if (!body.nombre || body.nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio y debe tener al menos 2 caracteres." },
        { status: 400 }
      );
    }

    if (body.apellido && body.apellido.trim().length < 2) {
      return NextResponse.json(
        { error: "El apellido debe tener al menos 2 caracteres." },
        { status: 400 }
      );
    }

    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "El email no es válido." },
          { status: 400 }
        );
      }
    }

    if (body.telefono) {
      const telRegex = /^[0-9+\s-]+$/;
      if (!telRegex.test(body.telefono)) {
        return NextResponse.json(
          { error: "El teléfono solo puede contener números, espacios, + y -." },
          { status: 400 }
        );
      }
    }

    if (body.tipo_documento && !body.tipoClienteId) {
      return NextResponse.json(
        { error: "Si ingresás un documento, debés seleccionar un tipo de cliente." },
        { status: 400 }
      );
    }

    if (body.tipoClienteId) {
      const exists = await db.tipoCliente.findUnique({
        where: { id_tipo_cliente: Number(body.tipoClienteId) },
      });
      if (!exists) {
        return NextResponse.json(
          { error: "El tipo de cliente seleccionado no existe." },
          { status: 400 }
        );
      }
    }

    // ==== Crear cliente ====
    const cliente = await db.cliente.create({
      data: {
        nombre: body.nombre.trim(),
        apellido: body.apellido?.trim() || null,
        email: body.email?.trim() || null,
        telefono: body.telefono?.trim() || null,
        tipo_documento: body.tipo_documento?.trim() || null,
        descripcion: body.descripcion || null,
        tipoClienteId: body.tipoClienteId
          ? Number(body.tipoClienteId)
          : null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
