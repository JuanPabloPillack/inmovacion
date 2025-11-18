/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: traer todos los IPC
export async function GET() {
  try {
    const datos = await db.ipc.findMany({ orderBy: [{ anio: 'desc' }, { mes: 'desc' }] });
    return NextResponse.json({ datos });
  } catch (e: any) {
    return NextResponse.json({ datos: [], error: e.message });
  }
}

// POST: guardar varios IPC
export async function POST(req: NextRequest) {
  try {
    const nuevosDatos = await req.json();

    const created = await Promise.all(
      nuevosDatos.map(async (d: any) =>
        db.ipc.upsert({
          where: { mes_anio: { mes: d.mes, anio: d.anio } },
          update: { valor: d.valor, fuente: d.fuente, fechaConsulta: new Date(d.fechaConsulta) },
          create: { mes: d.mes, anio: d.anio, valor: d.valor, fuente: d.fuente, fechaConsulta: new Date(d.fechaConsulta) },
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'ID inválido' });

    await db.ipc.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

