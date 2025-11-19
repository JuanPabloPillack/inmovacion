"use client";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";

export default function NuevoInmueblePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* 🔹 Header superior general */}
      <Header />

      {/* 🔹 Subencabezado visual (igual estilo que cobranzas) */}
      <header
        className="bg-white shadow-sm border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "#e8f6fc" }}
            >
              <Home className="w-7 h-7" style={{ color: "#63bae9" }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#686363" }}>
                Nuevo Inmueble
              </h1>
              <p className="text-sm mt-1" style={{ color: "#969696" }}>
                Agrega los detalles del nuevo inmueble al sistema
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div
          className="bg-white rounded-2xl shadow-sm border p-8"
          style={{ borderColor: "#e5e7eb" }}
        >
          <FormularioInmueble
            onSuccess={() => {
              router.push("/propiedades/modulo");
            }}
          />
        </div>
      </main>
    </div>
  );
}
