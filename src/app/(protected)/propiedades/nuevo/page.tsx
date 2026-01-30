// src/app/(protected)/propiedades/nuevo/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSignature } from "lucide-react";

import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";
import Loading from "@/components/ui/Loading";

export default function NuevoInmueblePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Simula carga inicial al refrescar
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 🔹 LOADING GLOBAL
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading
          message="Cargando formulario..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#e8f6fc]">
            <FileSignature className="w-7 h-7 text-[#63bae9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-700">
              Nuevo Inmueble
            </h1>
            <p className="text-sm mt-1 text-gray-500">
              Agrega los detalles del nuevo inmueble
            </p>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <FormularioInmueble
            onSuccess={() => router.push("/propiedades")}
            onCancel={() => router.push("/propiedades")}
          />
        </div>
      </main>
    </div>
  );
}
