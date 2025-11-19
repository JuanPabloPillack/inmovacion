// rendiciones/ipc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Tipos para validar entrada
interface IPCEntrada {
  mes: number;
  anio: number;
  valor: number;
  fuente: string;
  fechaConsulta: string;
}

// =====================================================
// GET — Traer todos los IPC ordenados por año y mes
// =====================================================
export async function GET() {
  try {
    const datos = await db.ipc.findMany({
      orderBy: [{ anio: "desc" }, { mes: "desc" }],
    });

    return NextResponse.json({ datos });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ datos: [], error });
  }
}

// =====================================================
// POST — Guardar o actualizar múltiples IPC
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const nuevosDatos = (await req.json()) as IPCEntrada[];

    const created = await Promise.all(
      nuevosDatos.map((d) =>
        db.ipc.upsert({
          where: {
            mes_anio: { mes: d.mes, anio: d.anio },
          },
          update: {
            valor: d.valor,
            fuente: d.fuente,
            fechaConsulta: new Date(d.fechaConsulta),
          },
          create: {
            mes: d.mes,
            anio: d.anio,
            valor: d.valor,
            fuente: d.fuente,
            fechaConsulta: new Date(d.fechaConsulta),
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ success: false, error });
  }
}

// =====================================================
// DELETE — Eliminar un registro IPC por ID
// =====================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({
        success: false,
        error: "Falta el parámetro ID",
      });
    }

    const id = Number(idStr);
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: "ID inválido",
      });
    }

    await db.ipc.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ success: false, error });
  }
}
