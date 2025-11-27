// src/app/(protected)/propiedades/nuevo/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";

export default function NuevoInmueblePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#e8f6fc]">
            <Home className="w-7 h-7 text-[#63bae9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Nuevo Inmueble</h1>
            <p className="text-sm mt-1 text-gray-500">
              Agrega los detalles del nuevo inmueble
            </p>
          </div>
        </div>
      </header>

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
