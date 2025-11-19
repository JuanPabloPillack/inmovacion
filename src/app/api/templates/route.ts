// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { parseOfficeAsync } from 'officeparser';
import { db } from '@/lib/db';
import { z } from 'zod';
import { auth } from '../../../../auth';

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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Validar datos básicos
    const validatedData = templateSchema.parse({ nombre, tipo });
    if (!file) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    // === VALIDACIÓN DE TIPO DE ARCHIVO (.docx) ===
    const validExtension = '.docx';
    const validMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!file.name.toLowerCase().endsWith(validExtension)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos con extensión .docx' },
        { status: 400 }
      );
    }

    if (file.type !== validMimeType) {
      return NextResponse.json(
        { error: 'El archivo no es un documento Word válido (.docx)' },
        { status: 400 }
      );
    }

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public/uploads/templates', filename);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    // Extraer texto y campos variables
    let text: string;
    try {
      text = (await parseOfficeAsync(filePath)) as string;
    } catch (parseError) {
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json(
        { error: 'No se pudo leer el archivo Word. Asegúrate de que sea un .docx válido.' },
        { status: 400 }
      );
    }

    const regex = /\{([^}]+)\}/g;
    const matches = text.matchAll(regex);
    const campos = [...new Set([...matches].map((match) => match[1].trim()))];

    // === VALIDACIÓN: PLANTILLA DEBE TENER AL MENOS UN CAMPO VARIABLE ===
    if (campos.length === 0) {
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json(
        { 
          error: 'La plantilla no contiene campos variables. Debe incluir al menos un campo con formato {nombre_campo} en el documento.' 
        },
        { status: 400 }
      );
    }

    // Guardar en DB
    const template = await db.template.create({
      data: {
        nombre: validatedData.nombre,
        archivoPath: `/uploads/templates/${filename}`,
        camposVariables: campos,
        tipo: validatedData.tipo,
        createdById: session.user.id,
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
        include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.template.count({ where }),
    ]);
    const formattedTemplates = templates.map((t) => ({
  ...t,
  createdBy: {
    id: t.createdBy.id,
    name: t.createdBy.name || t.createdBy.email || 'Usuario desconocido',
  },
}));

    return NextResponse.json({ templates: formattedTemplates, total, page, pageSize }, { status: 200 });
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