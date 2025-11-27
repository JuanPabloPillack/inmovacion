// src/app/(protected)/propiedades/modificar/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Home } from "lucide-react";
import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";
import type { InmuebleEdit } from "@/types/inmuebles";

interface ImagenData {
  url: string;
  principal: boolean;
  file?: File;
}

export default function EditarInmueblePage() {
  const { id } = useParams();
  const router = useRouter();
  const [inmueble, setInmueble] = useState<InmuebleEdit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInmueble = async () => {
      try {
        const res = await fetch(`/api/inmuebles/${id}`);
        if (!res.ok) throw new Error("Error al obtener inmueble");

        const data = await res.json();
        const src = data.inmueble ?? data;

        const inmuebleData: InmuebleEdit = {
          ...src,
          id_barrio: src.ubicacion?.barrio?.id_barrio ?? undefined,
          ubicacion: {
            ...src.ubicacion,
            barrio: src.ubicacion?.barrio?.nombre ?? "",
          },
        };

        setInmueble(inmuebleData);
      } catch {
        alert("No se pudo cargar el inmueble");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInmueble();
  }, [id]);

  const handleUpdate = async (formData: FormData, imagenes: ImagenData[]) => {
    if (!id) return;

    try {
      const uploadedImages: { url: string; principal: boolean }[] = [];

      for (const img of imagenes) {
        if (img.file) {
          const form = new FormData();
          form.append("file", img.file);
          const res = await fetch("/api/upload", { method: "POST", body: form });
          if (!res.ok) throw new Error("Error al subir imagen");
          const data = await res.json();
          uploadedImages.push({ url: data.url, principal: img.principal });
        } else {
          uploadedImages.push({ url: img.url, principal: img.principal });
        }
      }

      const raw = Object.fromEntries(formData.entries());

      const payload = {
        ...raw,
        id_tipo_inmueble: Number(raw.id_tipo_inmueble),
        id_estado: Number(raw.id_estado),
        id_cliente: Number(raw.id_cliente),
        id_operacion: raw.id_operacion ? Number(raw.id_operacion) : undefined,
        id_barrio: raw.id_barrio ? Number(raw.id_barrio) : undefined,
        precio: raw.precio ? Number(raw.precio) : undefined,
        superficie_total: raw.superficie_total ? Number(raw.superficie_total) : undefined,
        superficie_cubierta: raw.superficie_cubierta ? Number(raw.superficie_cubierta) : undefined,
        cantidad_ambientes: raw.cantidad_ambientes ? Number(raw.cantidad_ambientes) : undefined,
        cantidad_banos: raw.cantidad_banos ? Number(raw.cantidad_banos) : undefined,
        cantidad_dormitorios: raw.cantidad_dormitorios ? Number(raw.cantidad_dormitorios) : undefined,
        cantidad_cocheras: raw.cantidad_cocheras ? Number(raw.cantidad_cocheras) : undefined,
        cantidad_pisos: raw.cantidad_pisos ? Number(raw.cantidad_pisos) : undefined,
        antiguedad: raw.antiguedad ? Number(raw.antiguedad) : undefined,
        imagenes: uploadedImages,
      };

      const res = await fetch(`/api/inmuebles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar inmueble");

      alert("✅ Inmueble actualizado correctamente");
      router.push("/propiedades");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar inmueble");
    }
  };

  const handleCancel = () => router.push("/propiedades");

  if (loading)
    return <div className="p-8 text-gray-600">Cargando inmueble...</div>;

  if (!inmueble)
    return <div className="p-8 text-red-500">Inmueble no encontrado.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <Header />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#e8f6fc]">
            <Home className="w-7 h-7 text-[#63bae9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Modificar Inmueble</h1>
            <p className="text-sm mt-1 text-gray-500">
              Edita la información del inmueble seleccionado
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <FormularioInmueble
            initialData={inmueble}
            submitHandler={handleUpdate}
            submitLabel="Actualizar Inmueble"
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  );
}
