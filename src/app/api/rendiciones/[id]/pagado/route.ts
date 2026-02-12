// src/app/api/rendiciones/[id]/pagado/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../../../auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const id_rendicion = Number(id);

  if (isNaN(id_rendicion)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { pagado } = await req.json();

    if (typeof pagado !== "boolean") {
      return NextResponse.json({ error: "pagado debe ser boolean" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user =
      (await db.user.findUnique({ where: { id: session.user.id } })) ??
      (await db.user.create({
        data: {
          id: session.user.id,
          name: session.user.name ?? "Usuario",
          email: session.user.email ?? `user_${session.user.id}@example.com`,
        },
      }));

    const rendicion = await db.rendicion.update({
      where: { id_rendicion },
      data: {
        pagado,
        updatedById: user.id,
      },
    });

    return NextResponse.json({ success: true, pagado: rendicion.pagado });

  } catch (err: any) {
    return NextResponse.json(
      { error: "No se pudo actualizar el estado", detail: err.message || String(err) },
      { status: 500 }
    );
  }
}
