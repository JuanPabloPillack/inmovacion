/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/contracts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const id_cliente = parseInt(searchParams.get('id_cliente') || '0') || undefined;
    const id_inmueble = parseInt(searchParams.get('id_inmueble') || '0') || undefined;
    const id_template = parseInt(searchParams.get('id_template') || '0') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {};

    if (search) {
      where.nombre = { contains: search };
    }
    if (fechaDesde) {
      where.fecha_inicio = { gte: new Date(fechaDesde) };
    }
    if (id_cliente) {
      where.id_cliente = id_cliente;
    }
    if (id_inmueble) {
      where.id_inmueble = id_inmueble;
    }
    if (id_template) {
      where.id_template = id_template;
    }

    const [contratos, total] = await Promise.all([
      db.contrato.findMany({
        where,
        include: {
          cliente: { select: { nombre: true } },
          inmueble: { select: { titulo: true } },
          template: { select: { nombre: true } },
        },
        orderBy: { createdAt: 'asc' },
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
    const {
      nombre,
      id_cliente,
      id_inmueble,
      id_template,
      valores,
      fecha_inicio,
      fecha_fin,
      monto,
    } = data;

    if (!nombre || !id_cliente || !id_inmueble || !id_template || !valores || !fecha_inicio || !fecha_fin || !monto) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    console.log('Valores recibidos:', valores);

    const template = await db.template.findUnique({ where: { id: id_template } });
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });
    }

    console.log('Campos del template:', template.camposVariables);

    const content = await fs.readFile(path.join(process.cwd(), 'public', template.archivoPath));
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });

    doc.render(valores);

    const outputDir = path.join(process.cwd(), 'public/uploads/contracts');
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${Date.now()}-${nombre.replace(/\s+/g, '_')}.docx`;
    const filePath = `/uploads/contracts/${filename}`;
    const outputPath = path.join(process.cwd(), 'public', filePath);
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    await fs.writeFile(outputPath, buffer);

    const contrato = await db.contrato.create({
      data: {
        nombre,
        id_cliente,
        id_inmueble,
        id_template,
        valores,
        archivoPath: filePath,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: new Date(fecha_fin),
        monto: parseFloat(monto),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ contrato, downloadUrl: filePath }, { status: 201 });
  } catch (error) {
    console.error('Error al crear contrato:', error);
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

    // Eliminar el archivo .docx si archivoPath existe
    if (contrato.archivoPath) {
      const filePath = path.join(process.cwd(), 'public', contrato.archivoPath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Archivo no encontrado para eliminar:', filePath);
      }
    }

    // Eliminar el contrato de la base de datos
    await db.contrato.delete({ where: { id_contrato: id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar contrato:', error);
    return NextResponse.json({ error: 'Error al eliminar el contrato' }, { status: 500 });
  }
}