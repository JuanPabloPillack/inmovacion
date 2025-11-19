// ===============================================
// Archivo: src/app/(protected)/pagos/editar/page.tsx
// Descripción: Editar pago a proveedor existente
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// UI
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

// Formulario
import PagoProveedorForm, {
  PagoProveedorFormValues
} from "@/components/ui/PagoProveedorForm";

// Actions
import {
  getPagoById,
  updatePago
} from "@/actions/pagos/pagos-actions";

export default function EditarPagoProveedorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id_pago = Number(params.get("id"));

  const { data: session, status } = useSession();

  // Data
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [mediosPago, setMediosPago] = useState<any[]>([]);
  const [estadosPago, setEstadosPago] = useState<any[]>([]);
  const [pago, setPago] = useState<any>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ---------------------------
  // Validar sesión
  // ---------------------------
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // ---------------------------
  // Cargar datos iniciales
  // ---------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const [resProv, resMedios, resEstados, pagoDB] = await Promise.all([
          fetch("/api/proveedores"),
          fetch("/api/medio-pago"),
          fetch("/api/estado-pago"),
          getPagoById(id_pago),
        ]);

        setProveedores(await resProv.json());
        setMediosPago(await resMedios.json());
        setEstadosPago(await resEstados.json());

        if (!pagoDB) {
          setErrorMessage("No se encontró el pago.");
          return;
        }

        // Prisma Decimal → convertir a string
        const importeString = pagoDB.importe?.toString() ?? "";

        setPago({
          proveedorId: pagoDB.proveedorId.toString(),
          medioPagoId: pagoDB.medioPagoId.toString(),
          estadoPagoId: pagoDB.estadoPagoId.toString(),
          concepto: pagoDB.concepto,
          importe: importeString,
          responsable: pagoDB.responsable,
          comprobante: pagoDB.comprobante ?? "",
          fecha_pago: pagoDB.fecha_pago?.substring(0, 10), // YYYY-MM-DD
        });

      } catch (e) {
        console.error("Error cargando datos:", e);
        setErrorMessage("No se pudieron cargar los datos del formulario.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id_pago]);

  if (loading)
    return <Loading message="Cargando datos del pago..." />;

  if (errorMessage)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );

  // ---------------------------
  // Guardar cambios
  // ---------------------------
  const handleSubmit = async (data: PagoProveedorFormValues) => {
    setSaving(true);
    try {
      const result = await updatePago(id_pago, {
        ...data,
        proveedorId: Number(data.proveedorId),
        medioPagoId: Number(data.medioPagoId),
        estadoPagoId: Number(data.estadoPagoId),
        importe: Number(data.importe),
        fecha_pago: data.fecha_pago,
      });

      if (!result.success) {
        throw new Error(result.message || "Error al actualizar pago");
      }

      setShowSuccess(true);
      setTimeout(() => router.push("/pagos"), 1500);

    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">

      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-4xl">

        <div className="flex items-center gap-3 mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#63bae9] text-[#63bae9]"
          >
            <a href="/pagos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </a>
          </Button>

          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#63bae9]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#686363]">
              Editar Pago a Proveedor
            </h1>
          </div>
        </div>

        {/* Éxito */}
        {showSuccess && (
          <Alert className="mb-6 bg-[#63bae9]/10 border-[#63bae9]/20">
            <CheckCircle className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription className="text-[#686363]">
              Pago actualizado correctamente. Redirigiendo…
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {!showSuccess && (
          <PagoProveedorForm
            proveedores={proveedores}
            mediosPago={mediosPago}
            estadosPago={estadosPago}
            modo="editar"
            initialData={pago}
            onSubmit={handleSubmit}
            onFormDirtyChange={setIsDirty}
          />
        )}
      </div>
    </div>
  );
}
