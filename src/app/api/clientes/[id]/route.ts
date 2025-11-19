// src/app/api/clientes/[id]/route.ts --> por pillack
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; // Await para resolver los parámetros
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
    }

    const cliente = await db.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        tipoCliente: true, // Incluir tipo de cliente para campos como "tipo_cliente"
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente, { status: 200 });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 });
  }
}