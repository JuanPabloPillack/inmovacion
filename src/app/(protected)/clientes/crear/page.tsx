// =============================================================
// Archivo: src/app/(protected)/clientes/crear/page.tsx
// Crear nuevo cliente (estilo idéntico a Proveedores)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CheckCircle, ArrowLeft, UserPlus, AlertCircle } from "lucide-react";

import ClienteForm from "@/components/ClienteForm";

export default function CrearClientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tipoClientes, setTipoClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ================================
  // Validar sesión
  // ================================
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // ================================
  // Cargar tipos de cliente
  // ================================
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/tipo-cliente");
        const data = await res.json();
        setTipoClientes(data);
      } catch (err) {
        console.error("Error cargando tipos de cliente:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ================================
  // Submit
  // ================================
  const handleSubmit = async (formData: any) => {
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al crear cliente");
      }

      setShowSuccess(true);

      setTimeout(() => router.push("/clientes"), 1500);

    } catch (error: any) {
      setErrorMessage(error.message);
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
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-[#63bae9]" />
            <h1 className="text-2xl font-bold text-[#686363]">
              Crear Cliente
            </h1>
          </div>
        </div>

        {showSuccess && (
          <Alert className="mb-6 bg-[#63bae9]/10 border-[#63bae9]/30">
            <CheckCircle className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription className="text-[#686363]">
              Cliente creado correctamente. Redirigiendo…
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {!showSuccess && (
          <ClienteForm
            tipoClientes={tipoClientes}
            modo="crear"
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
