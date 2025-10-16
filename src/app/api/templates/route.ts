// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { parseOfficeAsync } from 'officeparser';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const nombre = formData.get('nombre') as string;

    if (!file || !nombre) {
      return NextResponse.json({ error: 'Faltan el nombre o el archivo' }, { status: 400 });
    }

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public/uploads/templates', filename);
    await fs.writeFile(filePath, buffer);

    // Extraer texto y campos variables
    const text = await parseOfficeAsync(filePath) as string;
    
    // CLAVE: Extraer el nombre del campo SIN las llaves
    const regex = /\{([^}]+)\}/g;
    const matches = text.matchAll(regex);
    const campos = [...new Set([...matches].map(match => match[1].trim()))];
    
    console.log('Campos encontrados (sin llaves):', campos);

    // Guardar en la base de datos
    const template = await db.template.create({
      data: {
        nombre,
        archivoPath: `/uploads/templates/${filename}`,
        camposVariables: campos,
      },
    });

    return NextResponse.json({ template, campos }, { status: 201 });
  } catch (error) {
    console.error('Error al subir template:', error);
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    if (search) {
      where.nombre = { contains: search };
    }

    if (fechaDesde) {
      where.createdAt = { gte: new Date(fechaDesde) };
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
      const contratoNames = contratos.map(c => c.nombre).join(', ');
      return NextResponse.json(
        { error: `No se puede eliminar el template porque está en uso por los siguientes contratos: ${contratoNames}` },
        { status: 400 }
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