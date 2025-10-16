/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";

export default async function handler(req: any, res: any) {
  try {
    const propietarios = await db.cliente.findMany({
      where: { tipoCliente: { nombre: "Propietario" } },
      select: { id_cliente: true, nombre: true }
    });
    res.status(200).json(propietarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener propietarios" });
  }
}
