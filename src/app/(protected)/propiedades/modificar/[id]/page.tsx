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
        setInmueble(data.inmueble ?? data);
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

      const body = Object.fromEntries(formData.entries());

      const payload = {
        ...body,
        id_tipo_inmueble: Number(body.id_tipo_inmueble),
        id_estado: Number(body.id_estado),
        id_cliente: Number(body.id_cliente),
        id_operacion: body.id_operacion ? Number(body.id_operacion) : undefined,
        id_barrio: body.id_barrio ? Number(body.id_barrio) : undefined,
        precio: body.precio ? Number(body.precio) : undefined,
        superficie_total: body.superficie_total ? Number(body.superficie_total) : undefined,
        superficie_cubierta: body.superficie_cubierta ? Number(body.superficie_cubierta) : undefined,
        cantidad_ambientes: body.cantidad_ambientes ? Number(body.cantidad_ambientes) : undefined,
        cantidad_banos: body.cantidad_banos ? Number(body.cantidad_banos) : undefined,
        cantidad_dormitorios: body.cantidad_dormitorios ? Number(body.cantidad_dormitorios) : undefined,
        cantidad_cocheras: body.cantidad_cocheras ? Number(body.cantidad_cocheras) : undefined,
        cantidad_pisos: body.cantidad_pisos ? Number(body.cantidad_pisos) : undefined,
        antiguedad: body.antiguedad ? Number(body.antiguedad) : undefined,
        imagenes: uploadedImages,
      };

      const res = await fetch(`/api/inmuebles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar inmueble");

      alert("✅ Inmueble actualizado correctamente");
      router.push("/propiedades/modulo");
    } catch (error: any) {
      console.error("Error actualizando inmueble:", error);
      alert(error.message || "Error al actualizar inmueble");
    }
  };

  if (loading)
    return <div className="p-8 text-gray-600">Cargando inmueble...</div>;
  if (!inmueble)
    return <div className="p-8 text-red-500">Inmueble no encontrado.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* 🔹 Header superior general */}
      <Header />

      {/* 🔹 Subencabezado con ícono y título */}
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
                Modificar Inmueble
              </h1>
              <p className="text-sm mt-1" style={{ color: "#969696" }}>
                Edita la información del inmueble seleccionado
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
            initialData={inmueble}
            submitHandler={handleUpdate}
            submitLabel="Actualizar Inmueble"
          />
        </div>
      </main>
    </div>
  );
}
