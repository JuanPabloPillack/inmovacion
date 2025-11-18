// src/app/api/contracts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { z } from 'zod';

// Esquema de validación para PUT (sin cambios)
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

// Esquema para PATCH
const patchSchema = z.object({
  firmado: z.boolean().optional(),
  activo: z.boolean().optional(),
}).refine((data) => data.firmado !== undefined || data.activo !== undefined, {
  message: 'Se debe proporcionar al menos un campo: firmado o activo',
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const contrato = await db.contrato.findUnique({
      where: { id_contrato: id },
      select: {
        id_contrato: true,
        nombre: true,
        archivoPath: true,
        fecha_inicio: true,
        fecha_fin: true,
        monto: true,
        valores: true,
        id_cliente_1: true,
        id_cliente_2: true,
        id_inmueble: true,
        id_template: true,
        tipo_contrato: true,
        activo: true,
        firmado: true,
        createdAt: true,
        updatedAt: true,
        cliente_1: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        cliente_2: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        inmueble: {
          select: {
            titulo: true,
          },
        },
        template: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!contrato) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    return NextResponse.json(contrato);
  } catch (error) {
    console.error('Error al obtener contrato:', error);
    return NextResponse.json({ error: 'Error al cargar el contrato' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const data = await req.json();
    const validatedData = contractSchema.parse(data);

    const contrato = await db.contrato.findUnique({ where: { id_contrato: id } });
    if (!contrato) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });

    // Evitar edición de contratos inactivos
    if (!contrato.activo) {
      return NextResponse.json({ error: 'No se puede editar un contrato inactivo' }, { status: 400 });
    }

    const template = await db.template.findUnique({ where: { id: validatedData.id_template } });
    if (!template) return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });

    if (template.tipo !== validatedData.tipo_contrato) {
      return NextResponse.json(
        { error: 'El tipo de plantilla no coincide con el tipo de contrato' },
        { status: 400 },
      );
    }

    const content = await fs.readFile(path.join(process.cwd(), 'public', template.archivoPath));
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => '' });
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
      : validatedData.id_comprador!;
    
    const id_cliente_2 = validatedData.tipo_contrato === 'ALQUILER_LOCACION'
      ? validatedData.id_locatario!
      : validatedData.id_vendedor!;

    const updatedContrato = await db.contrato.update({
      where: { id_contrato: id },
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
      },
    });

    return NextResponse.json({ ...updatedContrato, downloadUrl: filePath }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const data = await req.json();
    const validatedData = patchSchema.parse(data);

    const contrato = await db.contrato.findUnique({ where: { id_contrato: id } });
    if (!contrato) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });

    // Validar que no se pueda desactivar un contrato firmado
    if (validatedData.activo === false && contrato.firmado) {
      return NextResponse.json(
        { error: 'No se puede desactivar un contrato firmado' },
        { status: 400 },
      );
    }

    const updatedContrato = await db.contrato.update({
      where: { id_contrato: id },
      data: {
        ...(validatedData.firmado !== undefined && { firmado: validatedData.firmado }),
        ...(validatedData.activo !== undefined && { activo: validatedData.activo }),
      },
    });

    return NextResponse.json(updatedContrato, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar el estado' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const contrato = await db.contrato.findUnique({ where: { id_contrato: id } });
    if (!contrato) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    // Validar que el contrato esté inactivo
    if (contrato.activo) {
      return NextResponse.json(
        { error: 'No se puede eliminar permanentemente un contrato activo' },
        { status: 400 },
      );
    }

    // Eliminar el archivo asociado
    if (contrato.archivoPath) {
      const filePath = path.join(process.cwd(), 'public', contrato.archivoPath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Archivo no encontrado para eliminar:', filePath);
      }
    }

    // Eliminar el contrato
    await db.contrato.delete({ where: { id_contrato: id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar contrato permanentemente:', error);
    return NextResponse.json({ error: 'Error al eliminar el contrato permanentemente' }, { status: 500 });
  }
}