// ===============================================
// Archivo: src/app/(protected)/proveedores/crear/page.tsx
// Descripción: Crear nuevo proveedor
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CheckCircle, ArrowLeft, FileText, AlertCircle } from "lucide-react";

// IMPORTA SOLO EL FORM
import PagoProveedorForm, {
  PagoProveedorFormValues,
} from "@/components/ui/PagoProveedorForm";

export default function CrearPagoProveedorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mediosPago, setMediosPago] = useState([]);
  const [estadosPago, setEstadosPago] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // ========================
  // VALIDAR SESIÓN
  // ========================
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // ========================
  // CARGAR DATOS INICIALES
  // ========================
  useEffect(() => {
    async function loadData() {
      try {
        const [proveRes, medioRes, estadoRes] = await Promise.all([
          fetch("/api/proveedores"),
          fetch("/api/medio-pago"),
          fetch("/api/estado-pago"),
        ]);

        setProveedores(await proveRes.json());
        setMediosPago(await medioRes.json());
        setEstadosPago(await estadoRes.json());
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ========================
  // CANCELAR
  // ========================
  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm("Hay cambios sin guardar. ¿Desea salir igual?")) return;
    }
    router.push("/pagos");
  };

  // ========================
  // SUBMIT (POST)
  // ========================
  const handleSubmit = async (data: PagoProveedorFormValues) => {
    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
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
        throw new Error(result.message || "Error al registrar el pago");
      }

      setShowSuccess(true);
      setTimeout(() => router.push("/pagos"), 1500);
    } catch (e: any) {
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
        
        <div className="flex items-center gap-3 mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#63bae9] text-[#63bae9]"
          >
            <Link href="/pagos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#63bae9]" />
            <h1 className="text-2xl font-bold text-[#686363]">
              Registrar Pago a Proveedor
            </h1>
          </div>
        </div>

        {/* ÉXITO */}
        {showSuccess && (
          <Alert className="mb-6 bg-[#63bae9]/10 border-[#63bae9]/30">
            <CheckCircle className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription className="text-[#686363]">
              Pago registrado correctamente. Redirigiendo…
            </AlertDescription>
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
            modo="crear"
            onSubmit={handleSubmit}
            onFormDirtyChange={setIsDirty}
          />
        )}
      </div>
    </div>
  );
}