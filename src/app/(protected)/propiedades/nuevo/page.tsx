/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/propiedades/nuevo/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileSignature } from "lucide-react";

import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";
import Loading from "@/components/ui/Loading";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function NuevoInmueblePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const crearInmuebleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("ERROR_CREAR");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Inmueble creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["inmuebles"] });
      router.push("/propiedades");
    },
    onError: () => {
      toast.error("No se pudo crear el inmueble");
    },
  });

  // 🔹 LOADING GLOBAL
  if (crearInmuebleMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Guardando inmueble..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

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

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <FormularioInmueble
            submitHandler={async (formData, imagenes) => {
              // 👉 reutilizamos EXACTAMENTE la misma lógica
              // que ya arma el payload dentro del formulario
              const fields = Object.fromEntries(formData.entries());

              const payload = {
                ...fields,
                imagenes,
              };

              await crearInmuebleMutation.mutateAsync(payload);
            }}
            onCancel={() => router.push("/propiedades")}
          />
        </div>
      </main>
    </div>
  );
}
