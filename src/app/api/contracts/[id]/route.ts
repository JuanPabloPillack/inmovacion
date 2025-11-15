// src/app/api/contracts/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
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
        valores: true,        // ✅ AGREGADO
        id_cliente: true,     // ✅ AGREGADO
        id_inmueble: true,    // ✅ AGREGADO
        id_template: true,    // ✅ AGREGADO
        cliente: {
          select: {
            nombre: true,
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

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const data = await req.json();
    const { nombre, id_cliente, id_inmueble, id_template, valores, fecha_inicio, fecha_fin, monto } = data;

    const template = await db.template.findUnique({ where: { id: id_template } });
    if (!template) return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 });

    const content = await fs.readFile(path.join(process.cwd(), 'public', template.archivoPath));
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => '' });
    doc.render(valores);

    const outputDir = path.join(process.cwd(), 'public/uploads/contracts');
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${Date.now()}-${nombre.replace(/\s+/g, '_')}.docx`;
    const filePath = `/uploads/contracts/${filename}`;
    const outputPath = path.join(process.cwd(), 'public', filePath);
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    await fs.writeFile(outputPath, buffer);

    const updatedContrato = await db.contrato.update({
      where: { id_contrato: id },
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
      },
    });

    return NextResponse.json({ ...updatedContrato, downloadUrl: filePath }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}