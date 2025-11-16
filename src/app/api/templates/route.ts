// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { parseOfficeAsync } from 'officeparser';
import { db } from '@/lib/db';
import { z } from 'zod';

// Esquema de validación para POST
const templateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  tipo: z.enum(['ALQUILER_LOCACION', 'COMPRA_VENTA'], { message: 'Tipo inválido' }),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const nombre = formData.get('nombre') as string;
    const tipo = formData.get('tipo') as string;

    // Validar datos
    const validatedData = templateSchema.parse({ nombre, tipo });
    if (!file) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public/uploads/templates', filename);
    await fs.writeFile(filePath, buffer);

    // Extraer texto y campos variables
    const text = (await parseOfficeAsync(filePath)) as string;
    const regex = /\{([^}]+)\}/g;
    const matches = text.matchAll(regex);
    const campos = [...new Set([...matches].map((match) => match[1].trim()))];

    console.log('Campos encontrados (sin llaves):', campos);

    // Guardar en la base de datos
    const template = await db.template.create({
      data: {
        nombre: validatedData.nombre,
        archivoPath: `/uploads/templates/${filename}`,
        camposVariables: campos,
        tipo: validatedData.tipo,
      },
    });

    return NextResponse.json({ template, campos }, { status: 201 });
  } catch (error) {
    console.error('Error al subir template:', error);
    if (error instanceof z.ZodError) {
return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const tipo = searchParams.get('tipo');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    if (search) {
      where.nombre = { contains: search, mode: 'insensitive' };
    }

    if (fechaDesde) {
      where.createdAt = { gte: new Date(fechaDesde) };
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const [templates, total] = await Promise.all([
      db.template.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.template.count({ where }),
    ]);

    return NextResponse.json({ templates, total, page, pageSize }, { status: 200 });
  } catch (error) {
    console.error('Error al listar templates:', error);
    return NextResponse.json({ error: 'Error al obtener templates' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const template = await db.template.findUnique({ where: { id } });

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });
    }

    // Verificar si el template está en uso por contratos
    const contratos = await db.contrato.findMany({
      where: { id_template: id },
      select: { nombre: true },
    });

    if (contratos.length > 0) {
      const contratoNames = contratos.map((c) => c.nombre).join(', ');
      return NextResponse.json(
        { error: `No se puede eliminar el template porque está en uso por los siguientes contratos: ${contratoNames}` },
        { status: 400 },
      );
    }

    // Eliminar el archivo del template
    await fs.unlink(path.join(process.cwd(), 'public', template.archivoPath));

    // Eliminar el template de la base de datos
    await db.template.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar template:', error);
    return NextResponse.json({ error: 'Error al eliminar template' }, { status: 500 });
  }
}