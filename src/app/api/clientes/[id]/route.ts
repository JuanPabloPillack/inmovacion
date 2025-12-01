// src/app/api/clientes/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const cliente = await db.cliente.findUnique({
      where: { id_cliente: numId },
      include: { tipoCliente: true },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Validaciones
    if (!body.nombre || body.nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres." },
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
        return NextResponse.json({ error: "Email inválido" }, { status: 400 });
      }
    }

    if (body.tipo_documento && !body.tipoClienteId) {
      return NextResponse.json(
        { error: "Si hay documento, debe haber un tipo de cliente." },
        { status: 400 }
      );
    }

    const cliente = await db.cliente.update({
      where: { id_cliente: numId },
      data: {
        nombre: body.nombre.trim(),
        apellido: body.apellido?.trim() || null,
        email: body.email?.trim() || null,
        telefono: body.telefono?.trim() || null,
        tipo_documento: body.tipo_documento?.trim() || null,
        descripcion: body.descripcion || null,
        tipoClienteId: body.tipoClienteId ? Number(body.tipoClienteId) : null,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await db.cliente.delete({
      where: { id_cliente: numId },
    });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}