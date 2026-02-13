// src/app/api/clientes/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ==========================
// GET
// ==========================
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const numId = Number(params.id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const cliente = await db.cliente.findUnique({
      where: { id_cliente: numId },
      include: {
        tiposCliente: {
          include: {
            tipoCliente: true,
          },
        },
        tipoDocumento: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json(
      { error: "Error al obtener cliente" },
      { status: 500 }
    );
  }
}

// ==========================
// PUT
// ==========================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const numId = Number(params.id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();

    if (!body.nombre || body.nombre.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres." },
        { status: 400 }
      );
    }

    // Verificar tipo documento
    if (body.tipoDocumentoId) {
      const exists = await db.tipoDocumento.findUnique({
        where: { id_tipo_documento: Number(body.tipoDocumentoId) },
      });

      if (!exists) {
        return NextResponse.json(
          { error: "El tipo de documento seleccionado no existe." },
          { status: 400 }
        );
      }
    }

    // ==========================
    // ACTUALIZAR
    // ==========================
    const cliente = await db.cliente.update({
      where: { id_cliente: numId },
      data: {
        nombre: body.nombre.trim(),
        apellido: body.apellido?.trim() || null,
        email: body.email?.trim() || null,
        telefono: body.telefono?.trim() || null,
        numero_documento: body.numeroDocumento?.trim() || null,
        tipoDocumentoId: body.tipoDocumentoId
          ? Number(body.tipoDocumentoId)
          : null,
        descripcion: body.descripcion || null,

        // 🔥 RELACIÓN N:N CORRECTA
        tiposCliente: {
          set: [], // limpia relaciones actuales
          connect:
            body.tipoClienteIds?.map((id: number) => ({
              clienteId: numId,
              tipoClienteId: id,
            })) || [],
        },
      },
      include: {
        tiposCliente: {
          include: {
            tipoCliente: true,
          },
        },
        tipoDocumento: true,
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

// ==========================
// DELETE
// ==========================
export async function deleteClienteInteligente(id: number) {
  try {
    // 1️⃣ Verificar relaciones
    const cliente = await db.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        inmuebles: true,
        contratos_1: true,
        contratos_2: true,
        cobranzas: true,
        pagos: true,
        historial: true,
      },
    });

    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    const tieneRelaciones =
      cliente.inmuebles.length > 0 ||
      cliente.contratos_1.length > 0 ||
      cliente.contratos_2.length > 0 ||
      cliente.cobranzas.length > 0 ||
      cliente.pagos.length > 0 ||
      cliente.historial.length > 0;

    // 2️⃣ Si tiene relaciones → soft delete
    if (tieneRelaciones) {
      const actualizado = await db.cliente.update({
        where: { id_cliente: id },
        data: { activo: false },
      });

      return {
        tipo: "soft",
        cliente: actualizado,
      };
    }

    // 3️⃣ Si NO tiene relaciones → delete real
    const eliminado = await db.cliente.delete({
      where: { id_cliente: id },
    });

    return {
      tipo: "hard",
      cliente: eliminado,
    };

  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw new Error("No se pudo eliminar el cliente.");
  }
}
