"use server"

import { db } from "@/lib/db"
import type { Client } from "../../types/client"

// Obtener todos los clientes
export async function getClients(): Promise<Client[]> {
  const clients = await db.client.findMany()
  return clients.map(client => ({
    ...client,
    phone: client.phone ?? undefined,
  }))
}

// Crear cliente
export async function createClient(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  type: "PROPIETARIO" | "COMPRADOR" | "INQUILINO"
}): Promise<Client> {
  const client = await db.client.create({
    data: {
      ...data,
      status: "ACTIVE",
    },
  })
  return { ...client, phone: client.phone ?? undefined }
}

// Actualizar cliente
export async function updateClient(
  id: string,
  data: Partial<Pick<Client, "firstName" | "lastName" | "email" | "phone" | "type" | "status">>
): Promise<Client> {
  const client = await db.client.update({
    where: { id },
    data,
  })
  return { ...client, phone: client.phone ?? undefined }
}

// Cambiar estado (activar/inactivar cliente)
export async function toggleClientStatus(id: string): Promise<Client> {
  const client = await db.client.findUnique({ where: { id } })
  if (!client) throw new Error("Cliente no encontrado")

  const updatedClient = await db.client.update({
    where: { id },
    data: { status: client.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  })
  return { ...updatedClient, phone: updatedClient.phone ?? undefined }
}

// Eliminar cliente
export async function deleteClient(id: string): Promise<Client> {
  const client = await db.client.delete({ where: { id } })
  return { ...client, phone: client.phone ?? undefined }
}

// Buscar clientes según campo y query
// src/actions/client-action.ts

export async function searchClients(
  field: keyof Pick<Client, "firstName" | "lastName" | "email" | "type">,
  query: string
): Promise<Client[]> {
  if (field === "type") {
    // Para enum
    const clients = await db.client.findMany({
      where: {
        type: query.toUpperCase() as any, // asegúrate que coincida con tu enum: "PROPIETARIO" | "COMPRADOR" | "INQUILINO"
      },
    })
    return clients.map(client => ({
      ...client,
      phone: client.phone ?? undefined,
    }))
  } else {
    // Para strings
    const clients = await db.client.findMany({
      where: {
        [field]: {
          contains: query,
        },
      },
    })
    return clients.map(client => ({
      ...client,
      phone: client.phone ?? undefined,
    }))
  }
}

