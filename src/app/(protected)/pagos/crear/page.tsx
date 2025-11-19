// ===============================================
// Archivo: src/app/(protected)/pagos/crear/page.tsx
// Descripción: Registrar nuevo Pago a Proveedor
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// UI
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import { FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

// Formulario
import PagoProveedorForm, {
  PagoProveedorFormValues,
} from "@/components/ui/PagoProveedorForm";

export default function CrearPagoProveedorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // DATA
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [mediosPago, setMediosPago] = useState<any[]>([]);
  const [estadosPago, setEstadosPago] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // FEEDBACK
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // ====================================
  // VALIDAR SESIÓN
  // ====================================
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // ====================================
  // CARGAR DATOS NECESARIOS
  // ====================================
  useEffect(() => {
    async function fetchAll() {
      try {
        const [provRes, mediosRes, estadosRes] = await Promise.all([
          fetch("/api/proveedores"),
          fetch("/api/medio-pago"),
          fetch("/api/estado-pago"),
        ]);

        if (!provRes.ok || !mediosRes.ok || !estadosRes.ok) {
          throw new Error("Error obteniendo datos del formulario.");
        }

        setProveedores(await provRes.json());
        setMediosPago(await mediosRes.json());
        setEstadosPago(await estadosRes.json());
      } catch (err) {
        console.error("Error cargando datos:", err);
        setErrorMessage("No se pudieron cargar los datos del formulario.");
      } finally {
        setLoadingData(false);
      }
    }

    fetchAll();
  }, []);

  // ====================================
  // CANCELAR
  // ====================================
  const handleCancel = () => {
    if (isFormDirty) {
      if (!window.confirm("Hay cambios sin guardar, ¿desea salir igualmente?")) return;
    }
    router.push("/pagos");
  };

  // ====================================
  // SUBMIT
  // ====================================
  const handleSubmit = async (data: PagoProveedorFormValues) => {
    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          proveedorId: Number(data.proveedorId),
          medioPagoId: Number(data.medioPagoId),
          estadoPagoId: Number(data.estadoPagoId),
          importe: Number(data.importe),
        }),
      });

      let result = null;
      try {
        result = await res.json();
      } catch {
        throw new Error("Respuesta inválida del servidor.");
      }

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Error al registrar el pago");
      }

      setShowSuccess(true);
      setTimeout(() => router.push("/pagos"), 1500);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  if (loadingData)
    return <p className="p-6">Cargando datos del formulario…</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">

      {/* Header */}
      <div className="bg-white border-b border-[#969696]/50 shadow-sm w-full">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">

        {/* NAV */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#63bae9] text-[#63bae9] hover:bg-[#63bae9] hover:text-white transition-all duration-200 hover:scale-105 shadow-md"
          >
            <Link href="/pagos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#63bae9]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#686363]">
                Registrar Pago a Proveedor
              </h1>
            </div>
          </div>
        </div>

        {/* ALERTA ÉXITO */}
        {showSuccess && (
          <Alert className="mb-6 max-w-2xl mx-auto shadow-lg border-[#63bae9]/20 bg-[#63bae9]/10">
            <CheckCircle className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription className="text-[#686363] text-sm">
              El pago fue registrado correctamente. Redirigiendo…
            </AlertDescription>
          </Alert>
        )}

        {/* ALERTA ERROR */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto shadow-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              {errorMessage}
            </AlertDescription>

            <div className="mt-4 flex gap-4 justify-center">
              <Button
                onClick={() => setErrorMessage(null)}
                className="h-12 bg-[#63bae9] text-white shadow-lg hover:scale-105"
              >
                Intentar nuevamente
              </Button>

              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-12 border-[#969696]/50 text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
              >
                Volver
              </Button>
            </div>
          </Alert>
        )}

        {/* FORM */}
        {!showSuccess && !errorMessage && (
          <PagoProveedorForm
            proveedores={proveedores}
            mediosPago={mediosPago}
            estadosPago={estadosPago}
            modo="crear"
            onSubmit={handleSubmit}
            onFormDirtyChange={setIsFormDirty}
          />
        )}
      </div>
    </div>
  );
}
