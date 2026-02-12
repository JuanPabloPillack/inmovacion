import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);

    if (isNaN(id)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const pago = await db.pagoProveedor.findUnique({
        where: { id_pago: id },
        include: {
            proveedor: true,
            medioPago: true,
            estadoPago: true,
        },
    });

    if (!pago) {
        return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();

    page.drawText(`COMPROBANTE DE PAGO #${pago.id_pago}`, {
        x: 50,
        y: height - 50,
        size: 18,
        font,
    });

    const lines = [
        `Proveedor: ${pago.proveedor?.nombre_razon_social}`,
        `Concepto: ${pago.concepto}`,
        `Importe: $${pago.importe}`,
        `Medio de Pago: ${pago.medioPago?.nombre}`,
        `Estado: ${pago.estadoPago?.nombre}`,
        `Responsable: ${pago.responsable}`,
        `Fecha del Pago: ${new Date(pago.fecha_pago).toLocaleDateString("es-AR")}`,
    ];

    let y = height - 100;

    lines.forEach((line) => {
        page.drawText(line, {
            x: 50,
            y,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
        y -= 25;
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {

        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="pago-${pago.id_pago}.pdf"`,
        },
    });
}
