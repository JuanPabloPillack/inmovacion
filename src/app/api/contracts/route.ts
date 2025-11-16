// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Esquema de validación para POST
const contractSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  tipo_contrato: z.enum(['ALQUILER_LOCACION', 'COMPRA_VENTA'], { message: 'Tipo de contrato inválido' }),
  id_locador: z.number().int().positive('ID de locador inválido').optional(),
  id_locatario: z.number().int().positive('ID de locatario inválido').optional(),
  id_comprador: z.number().int().positive('ID de comprador inválido').optional(),
  id_vendedor: z.number().int().positive('ID de vendedor inválido').optional(),
  id_inmueble: z.number().int().positive('ID de inmueble inválido'),
  id_template: z.number().int().positive('ID de plantilla inválido'),
  valores: z.record(z.string(), z.string().min(1, 'Los valores no pueden estar vacíos')),
  fecha_inicio: z.string().min(1, 'Fecha de inicio obligatoria'),
  fecha_fin: z.string().min(1, 'Fecha de fin obligatoria'),
  monto: z.string().min(1, 'El monto es obligatorio').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'El monto debe ser un número positivo',
  }),
}).refine((data) => {
  if (data.tipo_contrato === 'ALQUILER_LOCACION') {
    return !!data.id_locador && !!data.id_locatario && data.id_locador !== data.id_locatario;
  }
  return !!data.id_comprador && !!data.id_vendedor && data.id_comprador !== data.id_vendedor;
}, {
  message: 'Deben especificarse dos clientes diferentes según el tipo de contrato',
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const id_cliente_1 = parseInt(searchParams.get('id_cliente_1') || '0') || undefined;
    const id_cliente_2 = parseInt(searchParams.get('id_cliente_2') || '0') || undefined;
    const id_inmueble = parseInt(searchParams.get('id_inmueble') || '0') || undefined;
    const id_template = parseInt(searchParams.get('id_template') || '0') || undefined;
    const tipo_contrato = searchParams.get('tipo_contrato') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    if (search) {
      where.nombre = { contains: search, mode: 'insensitive' };
    }

    if (fechaDesde || fechaHasta) {
      where.AND = where.AND || [];

      if (fechaDesde) {
        const [year, month, day] = fechaDesde.split('-').map(Number);
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        where.AND.push({ fecha_fin: { gte: startDate } });
      }

      if (fechaHasta) {
        const [year, month, day] = fechaHasta.split('-').map(Number);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        where.AND.push({ fecha_inicio: { lte: endDate } });
      }
    }

    if (id_cliente_1) where.id_cliente_1 = id_cliente_1;
    if (id_cliente_2) where.id_cliente_2 = id_cliente_2;
    if (id_inmueble) where.id_inmueble = id_inmueble;
    if (id_template) where.id_template = id_template;
    if (tipo_contrato) where.tipo_contrato = tipo_contrato;

    const [contratos, total] = await Promise.all([
      db.contrato.findMany({
        where,
        include: {
          cliente_1: { select: { nombre: true, apellido: true } },
          cliente_2: { select: { nombre: true, apellido: true } },
          inmueble: { select: { titulo: true } },
          template: { select: { nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.contrato.count({ where }),
    ]);

    return NextResponse.json({ contratos, total, page, pageSize }, { status: 200 });
  } catch (error) {
    console.error('Error al listar contratos:', error);
    return NextResponse.json({ error: 'Error al obtener contratos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const validatedData = contractSchema.parse(data);

    const template = await db.template.findUnique({ where: { id: validatedData.id_template } });
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });
    }

    // Validar que el tipo de plantilla coincide con el tipo de contrato
    if (template.tipo !== validatedData.tipo_contrato) {
      return NextResponse.json(
        { error: 'El tipo de plantilla no coincide con el tipo de contrato' },
        { status: 400 },
      );
    }

    const content = await fs.readFile(path.join(process.cwd(), 'public', template.archivoPath));
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });

    doc.render(validatedData.valores);

    const outputDir = path.join(process.cwd(), 'public/uploads/contracts');
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${Date.now()}-${validatedData.nombre.replace(/\s+/g, '_')}.docx`;
    const filePath = `/uploads/contracts/${filename}`;
    const outputPath = path.join(process.cwd(), 'public', filePath);
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    await fs.writeFile(outputPath, buffer);

    // Determinar id_cliente_1 y id_cliente_2 según el tipo de contrato
    const id_cliente_1 = validatedData.tipo_contrato === 'ALQUILER_LOCACION' 
      ? validatedData.id_locador! 
      : validatedData.id_comprador!;
    
    const id_cliente_2 = validatedData.tipo_contrato === 'ALQUILER_LOCACION'
      ? validatedData.id_locatario!
      : validatedData.id_vendedor!;

    const contrato = await db.contrato.create({
      data: {
        nombre: validatedData.nombre,
        tipo_contrato: validatedData.tipo_contrato,
        id_cliente_1,
        id_cliente_2,
        id_inmueble: validatedData.id_inmueble,
        id_template: validatedData.id_template,
        valores: validatedData.valores,
        archivoPath: filePath,
        fecha_inicio: new Date(validatedData.fecha_inicio),
        fecha_fin: new Date(validatedData.fecha_fin),
        monto: parseFloat(validatedData.monto),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ contrato, downloadUrl: filePath }, { status: 201 });
  } catch (error) {
    console.error('Error al crear contrato:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar el contrato' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del contrato' }, { status: 400 });
    }

    const contrato = await db.contrato.findUnique({ where: { id_contrato: id } });
    if (!contrato) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    if (contrato.archivoPath) {
      const filePath = path.join(process.cwd(), 'public', contrato.archivoPath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Archivo no encontrado para eliminar:', filePath);
      }
    }

    await db.contrato.delete({ where: { id_contrato: id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar contrato:', error);
    return NextResponse.json({ error: 'Error al eliminar el contrato' }, { status: 500 });
  }
}