/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/app/(protected)/pagos/[id]/page.tsx
// Descripción: Vista detallada de un pago a proveedor
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import { ArrowLeft, FileText, Edit, Trash2 } from "lucide-react";

// Actions
import { getPagoById, deletePago } from "@/actions/pagos/pagos-actions";

// Components
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function PagoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  // ============================
  // PARSEAR ID DE FORMA SEGURA
  // ============================
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);

  if (isNaN(id)) {
    return (
      <div className="p-10 text-center text-red-500 text-xl">
        Error: ID inválido
      </div>
    );
  }

  const [pago, setPago] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==============================
  // Cargar datos del Pago
  // ==============================
  const loadPago = async () => {
    try {
      const data = await getPagoById(id);
      setPago(data);
    } catch (error) {
      console.error("Error cargando pago:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    loadPago().finally(() => setLoading(false));
  }, [session, status]);

  if (loading || !pago) return <Loading message="Cargando pago..." />;

  // ==============================
  // Confirmar eliminación
  // ==============================
  const confirmDelete = async () => {
    try {
      await deletePago(id);
      router.push("/pagos");
    } catch (error) {
      console.error("Error eliminando pago:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">

        {/* Volver */}
        <Button
          variant="ghost"
          className="mb-6 text-[#686363] hover:text-[#63bae9]"
          onClick={() => router.push("/pagos")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        {/* Encabezado */}
        <Card className="mb-8 border-[#969696]/20 shadow-md">
          <CardHeader className="bg-[#63bae9]/5">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#63bae9]" />
              <CardTitle className="text-2xl font-bold text-[#686363]">
                Pago #{pago.id_pago}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="text-[#686363] space-y-2">

            <p><strong>Proveedor:</strong> {pago.proveedor?.nombre_razon_social}</p>
            <p><strong>Concepto:</strong> {pago.concepto}</p>
            <p><strong>Importe:</strong> ${pago.importe.toString()}</p>
            <p><strong>Medio de Pago:</strong> {pago.medioPago?.nombre}</p>
            <p><strong>Estado:</strong> {pago.estadoPago?.nombre}</p>
            <p><strong>Responsable:</strong> {pago.responsable}</p>
            <p><strong>Comprobante:</strong> {pago.comprobante || "—"}</p>

            <p>
              <strong>Fecha del Pago:</strong>{" "}
              {new Date(pago.fecha_pago).toLocaleDateString("es-AR")}
            </p>

            <p>
              <strong>Fecha de Registro:</strong>{" "}
              {new Date(pago.fecha).toLocaleDateString("es-AR")}
            </p>

            <p>
              <strong>Última modificación:</strong>{" "}
              {new Date(pago.fecha_modificacion).toLocaleDateString("es-AR")}
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4">

          {/* Editar */}
          <Button
            className="bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/80"
            onClick={() => router.push(`/pagos/editar?id=${pago.id_pago}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>

          {/* Eliminar */}
          <Button
            variant="destructive"
            className="gap-2 bg-red-500/80 hover:bg-red-600"
            onClick={() => setIsModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar pago?"
        message="Esto eliminará el pago definitivamente de la base de datos."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
