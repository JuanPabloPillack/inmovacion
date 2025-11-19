// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { auth } from '../../../../auth';

// Esquema de validación para POST (sin cambios)
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
    const firmado = searchParams.get('firmado');
    const activo = searchParams.get('activo');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    if (search) {
      where.nombre = { contains: search };
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
    if (firmado !== null) where.firmado = firmado === 'true';
    if (activo !== null) where.activo = activo === 'true';

    const [contratos, total] = await Promise.all([
      db.contrato.findMany({
        where,
        include: {
          cliente_1: { select: { nombre: true, apellido: true } },
          cliente_2: { select: { nombre: true, apellido: true } },
          inmueble: { select: { titulo: true } },
          template: { select: { nombre: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          updatedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.contrato.count({ where }),
    ]);

    const formattedContratos = contratos.map((contrato) => ({
      ...contrato,
      createdBy: {
        id: contrato.createdBy.id,
        name: contrato.createdBy.name || contrato.createdBy.email || 'Usuario desconocido',
      },
      updatedBy: {
        id: contrato.updatedBy.id,
        name: contrato.updatedBy.name || contrato.updatedBy.email || 'Usuario desconocido',
      },
    }));

    return NextResponse.json({ contratos: formattedContratos, total, page, pageSize }, { status: 200 });
  } catch (error) {
    console.error('Error al listar contratos:', error);
    return NextResponse.json({ error: 'Error al obtener contratos' }, { status: 500 });
  }
}

// POST and DELETE handlers remain unchanged
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const validatedData = contractSchema.parse(data);

    const template = await db.template.findUnique({ where: { id: validatedData.id_template } });
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });
    }

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

const id_cliente_1 = validatedData.tipo_contrato === 'ALQUILER_LOCACION' 
  ? validatedData.id_locador! 
  : validatedData.id_vendedor!;  

const id_cliente_2 = validatedData.tipo_contrato === 'ALQUILER_LOCACION'
  ? validatedData.id_locatario!
  : validatedData.id_comprador!; 

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
        activo: true,
        firmado: false,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
      include: {
        cliente_1: { select: { nombre: true, apellido: true } },
        cliente_2: { select: { nombre: true, apellido: true } },
        inmueble: { select: { titulo: true } },
        template: { select: { nombre: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const formattedContrato = {
      ...contrato,
      createdBy: {
        id: contrato.createdBy.id,
        name: contrato.createdBy.name || contrato.createdBy.email || 'Usuario desconocido',
      },
      updatedBy: {
        id: contrato.updatedBy.id,
        name: contrato.updatedBy.name || contrato.updatedBy.email || 'Usuario desconocido',
      },
    };

    return NextResponse.json({ contrato: formattedContrato, downloadUrl: filePath }, { status: 201 });
  } catch (error) {
    console.error('Error al crear contrato:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar el contrato' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del contrato' }, { status: 400 });
    }

    const contrato = await db.contrato.findUnique({ where: { id_contrato: id } });
    if (!contrato) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    if (contrato.firmado) {
      return NextResponse.json(
        { error: 'No se puede desactivar un contrato firmado' },
        { status: 400 },
      );
    }

    const updatedContrato = await db.contrato.update({
      where: { id_contrato: id },
      data: {
        activo: false,
        updatedById: session.user.id,
      },
      include: {
        cliente_1: { select: { nombre: true, apellido: true } },
        cliente_2: { select: { nombre: true, apellido: true } },
        inmueble: { select: { titulo: true } },
        template: { select: { nombre: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const formattedContrato = {
      ...updatedContrato,
      createdBy: {
        id: updatedContrato.createdBy.id,
        name: updatedContrato.createdBy.name || updatedContrato.createdBy.email || 'Usuario desconocido',
      },
      updatedBy: {
        id: updatedContrato.updatedBy.id,
        name: updatedContrato.updatedBy.name || updatedContrato.updatedBy.email || 'Usuario desconocido',
      },
    };

    return NextResponse.json({ success: true, contrato: formattedContrato }, { status: 200 });
  } catch (error) {
    console.error('Error al desactivar contrato:', error);
    return NextResponse.json({ error: 'Error al desactivar el contrato' }, { status: 500 });
  }
}