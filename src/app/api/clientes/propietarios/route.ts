/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const propietarios = await db.cliente.findMany({
      where: {
        tipoCliente: {
          is: {
            nombre: "Propietario",
          },
        },
      },
      select: {
        id_cliente: true,
        nombre: true,
        apellido: true,
        tipoCliente: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(propietarios);
  } catch (error) {
    console.error("Error al obtener propietarios:", error);
    return NextResponse.json(
      { error: "Error al obtener propietarios" },
      { status: 500 }
    );
  }
}
