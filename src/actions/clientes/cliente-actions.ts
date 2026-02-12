// ===============================================
// Archivo: src/actions/clientes/cliente-actions.ts
// Descripción: Acciones CRUD del módulo de clientes
// ===============================================

"use server";

import { db } from "@/lib/db";

// ======================================================
// VALIDACIONES REUTILIZABLES
// ======================================================
function validarCliente(data: any) {
  if (!data.nombre || data.nombre.trim().length < 2) {
    throw new Error("El nombre es obligatorio y debe tener al menos 2 caracteres.");
  }

  if (data.apellido && data.apellido.trim().length < 2) {
    throw new Error("El apellido debe tener al menos 2 caracteres.");
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("El email ingresado no es válido.");
    }
  }

  if (data.telefono) {
    const telRegex = /^[0-9+\s-]+$/;
    if (!telRegex.test(data.telefono)) {
      throw new Error("El teléfono solo puede contener números, espacios, + y -.");
    }
  }

  const tieneTipoDoc = !!data.tipoDocumentoId;
  const tieneNumeroDoc = !!data.numeroDocumento;

  if (tieneTipoDoc !== tieneNumeroDoc) {
    throw new Error(
      "Debe completar tanto el tipo de documento como el número de documento."
    );
  }
}

// ======================================================
// CREAR CLIENTE
// ======================================================
export async function createCliente(data: any) {
  try {
    validarCliente(data);

    console.log("TIPOS RECIBIDOS:", data.tipoClienteIds);

    return await db.cliente.create({
      data: {
        nombre: data.nombre.trim(),
        apellido: data.apellido?.trim() || null,
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        dumero_documento: data.numeroDocumento?.trim() || null,
        descripcion: data.descripcion || null,
        tipoDocumentoId: data.tipoDocumentoId
          ? Number(data.tipoDocumentoId)
          : null,

        tiposCliente:
          data.tipoClienteIds && data.tipoClienteIds.length > 0
            ? {
                create: data.tipoClienteIds.map((id: any) => ({
                  tipoCliente: {
                    connect: {
                      id_tipo_cliente: Number(id),
                    },
                  },
                })),
              }
            : undefined,
      },
    });
  } catch (error: any) {
    console.error("Error al crear cliente:", error);
    throw new Error(error.message || "No se pudo crear el cliente.");
  }
}


// ======================================================
// ACTUALIZAR CLIENTE
// ======================================================
export async function updateCliente(id: number, data: any) {
  try {
    validarCliente(data);

    await db.clienteTipo.deleteMany({
      where: { clienteId: id },
    });

    return await db.cliente.update({
      where: { id_cliente: id },
      data: {
        nombre: data.nombre.trim(),
        apellido: data.apellido?.trim() || null,
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        dumero_documento: data.numeroDocumento?.trim() || null,
        descripcion: data.descripcion || null,
        tipoDocumentoId: data.tipoDocumentoId
          ? Number(data.tipoDocumentoId)
          : null,

        tiposCliente:
          data.tipoClienteIds && data.tipoClienteIds.length > 0
            ? {
                create: data.tipoClienteIds.map((idTipo: any) => ({
                  tipoCliente: {
                    connect: {
                      id_tipo_cliente: Number(idTipo),
                    },
                  },
                })),
              }
            : undefined,
      },
    });
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    throw new Error(error.message || "No se pudo actualizar el cliente.");
  }
}



// ======================================================
// SOFT DELETE (activo = false)
// ======================================================
export async function softDeleteCliente(id: number) {
  try {
    const cliente = await db.cliente.update({
      where: { id_cliente: id },
      data: { activo: false },
    });

    return cliente;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw new Error("No se pudo eliminar el cliente.");
  }
}
