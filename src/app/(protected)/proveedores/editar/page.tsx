/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/app/(protected)/pagos/editar/[id]/page.tsx
// Descripción: Editar un pago a proveedor
// ===============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react";

import PagoProveedorForm from "@/components/PagoProveedorForm";

export default function EditarPagoProveedorPage() {
  const router = useRouter();
  const params = useParams();

  const { data: session, status } = useSession();

  // ==========================
  // ID seguro
  // ==========================
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);

  if (isNaN(id)) {
    return (
      <div className="text-center py-12 px-4 text-red-500 text-xl">
        Error: ID inválido
      </div>
    );
  }

  const [initialData, setInitialData] = useState<any>(null);
  const [proveedores, setProveedores] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [estadosPago, setEstadosPago] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // ==========================
  // Validar sesión
  // ==========================
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // ==========================
  // Cargar datos del pago y catálogos
  // ==========================
  useEffect(() => {
    async function load() {
      try {
        const [pago, prov, med, est] = await Promise.all([
          fetch(`/api/pagos/${id}`).then((r) => r.json()),
          fetch("/api/proveedores").then((r) => r.json()),
          fetch("/api/medio-pago").then((r) => r.json()),
          fetch("/api/estado-pago").then((r) => r.json()),
        ]);

        if (!pago || pago.error) {
          throw new Error("Pago no encontrado");
        }

        setInitialData({
          proveedorId: String(pago.proveedorId),
          medioPagoId: String(pago.medioPagoId),
          estadoPagoId: String(pago.estadoPagoId),
          concepto: pago.concepto,
          importe: String(pago.importe),
          comprobante: pago.comprobante || "",
          responsable: pago.responsable,
          fecha_pago: pago.fecha_pago?.slice(0, 10),
        });

        setProveedores(prov);
        setMediosPago(med);
        setEstadosPago(est);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setErrorMessage("Error cargando datos del pago.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ==========================
  // CANCELAR
  // ==========================
  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm("Hay cambios sin guardar. ¿Desea salir igual?"))
        return;
    }
    router.push("/pagos");
  };

  // ==========================
  // SUBMIT (PUT)
  // ==========================
  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/pagos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: Number(data.proveedorId),
          medioPagoId: Number(data.medioPagoId),
          estadoPagoId: Number(data.estadoPagoId),
          concepto: data.concepto,
          importe: Number(data.importe),
          fecha_pago: data.fecha_pago,
          comprobante: data.comprobante || null,
          responsable: data.responsable,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Error al actualizar pago.");
      }

      setShowSuccess(true);
      setTimeout(() => router.push("/pagos"), 1500);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message);
    }
  };

  if (loading) return <p className="p-6">Cargando datos...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <div className="bg-white border-b border-[#969696]/50 w-full">
        <Header />
      </div>

      <div className="container mx-auto p-4 max-w-5xl">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            className="border-[#63bae9] text-[#63bae9]"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>

          <FileText className="h-6 w-6 text-[#63bae9]" />
          <h1 className="text-2xl font-bold text-[#686363]">Editar Pago</h1>
        </div>

        {/* OK */}
        {showSuccess && (
          <Alert className="mb-6 bg-[#63bae9]/10">
            <CheckCircle className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription>Pago actualizado correctamente.</AlertDescription>
          </Alert>
        )}

        {/* ERROR */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* FORMULARIO */}
        {!showSuccess && (
          <PagoProveedorForm
            proveedores={proveedores}
            mediosPago={mediosPago}
            estadosPago={estadosPago}
            initialData={initialData}
            modo="editar"
            onSubmit={handleSubmit}
            onFormDirtyChange={setIsDirty}
          />
        )}
      </div>
    </div>
  );
}
