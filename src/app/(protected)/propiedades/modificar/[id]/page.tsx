// src/app/(protected)/propiedades/modificar/[id]/page.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Hooks de React y Next
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

//Loading
import Loading from "@/components/ui/Loading";

// Icono
import { Home } from "lucide-react";
import { Building, ArrowLeft, CheckCircle, AlertCircle, FileSignature } from "lucide-react"

//Alertas
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { Button } from "@/components/ui/button"

// Componentes propios
import Header from "@/components/ui/Header";
import FormularioInmueble from "@/components/FormularioInmueble";

// Tipos
import type { InmuebleEdit } from "@/types/inmuebles";

import Modal from "@/components/ui/Modal";

import Link from "next/link";

import { useQueryClient } from "@tanstack/react-query";



// Tipo para manejar imágenes en el frontend
interface ImagenData {
  url: string;
  principal: boolean;
  file?: File; // Si existe → imagen nueva aún no subida
}

// ========================
//   PÁGINA EDITAR INMUEBLE
// ========================
export default function EditarInmueblePage() {
  // Next.js obtiene el parámetro dinámico [id] desde la URL
  const { id } = useParams();

  const router = useRouter();
  const queryClient = useQueryClient();


  // Estado del inmueble cargado desde la API
  const [inmueble, setInmueble] = useState<InmuebleEdit | null>(null);

  // Para mostrar loading mientras se obtiene el inmueble
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info" | "danger";
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
  });


  // --------------------------------------------------------
  // 1. FETCH para traer los datos del inmueble a editar
  // --------------------------------------------------------
  useEffect(() => {
    const fetchInmueble = async () => {
      try {
        // Llamada GET a /api/inmuebles/:id
        const res = await fetch(`/api/inmuebles/${id}`);
        if (!res.ok) throw new Error("Error al obtener inmueble");

        const data = await res.json();

        console.log("🔍 Frontend - Inmueble cargado:", data);

        // En algunos casos backend responde { inmueble: {...} }
        const src = data.inmueble ?? data;

        // Adaptación de datos para que coincidan con InmuebleEdit
        const inmuebleData: InmuebleEdit = {
  ...src,

  id_barrio: src.ubicacion?.barrio?.id_barrio ?? undefined,
  ubicacion: {
    ...src.ubicacion,
    barrio: src.ubicacion?.barrio?.nombre ?? "",
  },

  createdBy: src.createdBy
    ? { id: src.createdBy.id, name: src.createdBy.name }
    : null,

  updatedBy: src.updatedBy
    ? { id: src.updatedBy.id, name: src.updatedBy.name }
    : null,

  // 👇 ESTO ES LO QUE FALTABA
  imagenes: (src.imagenes ?? []).map((img: any) => ({
    url: img.url,
    principal: img.principal,
    // ❗ file NO se setea porque ya está subida
  })),
};

        setInmueble(inmuebleData);
      } catch (err: any) {
      console.error("❌ Error fetch inmueble:", err)

      setModalConfig({
        title: "Error",
        message: err.message || "No se pudo cargar el inmueble",
        variant: "error",
        onConfirm: () => {
          setModalOpen(false);
          router.push("/propiedades");
        },
      });
      setModalOpen(true);

      setInmueble(null);
    } finally {
          setLoading(false)
        }

    };

    if (id) fetchInmueble();
  }, [id]);

  // --------------------------------------------------------
  // 2. FUNCIÓN PARA ACTUALIZAR EL INMUEBLE (PUT)
  // --------------------------------------------------------
  const handleUpdate = async (formData: FormData, imagenes: ImagenData[]) => {
    if (!id) return;

    try {
      const uploadedImages: { url: string; principal: boolean }[] = [];

      // ----------------------------------------------
      // 2.1 Subir imágenes nuevas a Cloudinary
      // ----------------------------------------------
      for (const img of imagenes) {
        // Imagen nueva (file existe)
        if (img.file) {
          const uploadForm = new FormData();
          uploadForm.append("file", img.file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadForm, // enviamos el archivo
          });

          if (!res.ok) throw new Error("Error al subir imagen");

          const data = await res.json();

          uploadedImages.push({
            url: data.url,
            principal: img.principal,
          });
        } else {
          // Imagen ya existente → solo reenviamos su URL
          uploadedImages.push({
            url: img.url,
            principal: img.principal,
          });
        }
      }

      // ----------------------------------------------
      // 2.2 Convertir FormData en un objeto normal
      // ----------------------------------------------
      const raw = Object.fromEntries(formData.entries());

      // Convertir campos numéricos y construir el payload final
      const payload = {
        ...raw,
        id_tipo_inmueble: Number(raw.id_tipo_inmueble),
        id_estado: Number(raw.id_estado),
        id_cliente: Number(raw.id_cliente),
        id_operacion: raw.id_operacion ? Number(raw.id_operacion) : undefined,
        id_barrio: raw.id_barrio ? Number(raw.id_barrio) : undefined,
        precio: raw.precio ? Number(raw.precio) : undefined,
        superficie_total: raw.superficie_total
          ? Number(raw.superficie_total)
          : undefined,
        superficie_cubierta: raw.superficie_cubierta
          ? Number(raw.superficie_cubierta)
          : undefined,
        cantidad_ambientes: raw.cantidad_ambientes
          ? Number(raw.cantidad_ambientes)
          : undefined,
        cantidad_banos: raw.cantidad_banos
          ? Number(raw.cantidad_banos)
          : undefined,
        cantidad_dormitorios: raw.cantidad_dormitorios
          ? Number(raw.cantidad_dormitorios)
          : undefined,
        cantidad_cocheras: raw.cantidad_cocheras
          ? Number(raw.cantidad_cocheras)
          : undefined,
        cantidad_pisos: raw.cantidad_pisos
          ? Number(raw.cantidad_pisos)
          : undefined,
        antiguedad: raw.antiguedad ? Number(raw.antiguedad) : undefined,

        imagenes: uploadedImages, // ← imagenes listas para guardar en DB
      };



      // ----------------------------------------------
      // 2.3 Enviar PUT al backend
      // ----------------------------------------------
      const res = await fetch(`/api/inmuebles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar inmueble");
      }

      let updatedData = null;
    try {
      const text = await res.text();
      updatedData = text ? JSON.parse(text) : null;
    } catch {
      updatedData = null;
    }

    console.log("🔄 Frontend - Response PUT:", updatedData);
    // 🔥 ACTUALIZAR CACHE INMEDIATAMENTE (optimistic)
queryClient.setQueriesData(
  { queryKey: ["inmuebles"], exact: false },
  (oldData: any) => {
    if (!oldData) return oldData;

    if (oldData.data) {
      return {
        ...oldData,
        data: oldData.data.map((item: any) =>
          item.id_inmueble == id
            ? { ...item, ...payload }
            : item
        ),
      };
    }

    if (Array.isArray(oldData)) {
      return oldData.map((item: any) =>
        item.id_inmueble == id
          ? { ...item, ...payload }
          : item
      );
    }

    return oldData;
  }
);

// 🔄 Refetch en background (sin await)
queryClient.invalidateQueries({ queryKey: ["inmuebles"] });
queryClient.invalidateQueries({ queryKey: ["inmueblesArchivados"] });



     setModalConfig({
        title: "Inmueble actualizado",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
        onConfirm: () => {
          setModalOpen(false);
          router.push("/propiedades");
        },
      });
      setModalOpen(true);

    } catch (err: any) {
      console.error("❌ Error handleUpdate:", err);
      setModalConfig({
        title: "Error",
        message: err.message || "No se pudo actualizar el inmueble",
        variant: "error",
      });
      setModalOpen(true);

    }
  };

  // --------------------------------------------------------
  // 3. Cancelar → vuelve a la lista
  // --------------------------------------------------------
  const handleCancel = () => router.push("/propiedades");

  // --------------------------------------------------------
  // 4. Render
  // --------------------------------------------------------

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading
        message="Cargando propiedad..."
        size="lg"
      />
    </div>
  );
}



return (
  <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
    <Header />

    {/* Header de la página */}

    <header className="bg-white shadow-sm border-b">
  <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-6">

    {/* 🔹 BOTÓN VOLVER */}
    <Button
      asChild
      variant="outline"
      size="sm"
      className="border-[#63bae9] text-[#63bae9]"
    >
      <Link href="/propiedades">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Link>
    </Button>

    {/* 🔹 ICONO */}
    <div className="p-3 rounded-xl bg-[#e8f6fc]">
      <FileSignature className="w-7 h-7 text-[#63bae9]" />
    </div>

    {/* 🔹 TITULO */}
    <div>
      <h1 className="text-3xl font-bold text-gray-700">
        Modificar Inmueble
      </h1>
      <p className="text-sm mt-1 text-gray-500">
        Agrega los detalles del nuevo inmueble
      </p>
    </div>
  </div>
</header>


    <main className="max-w-5xl mx-auto px-8 py-10">
      {/* 📝 FORMULARIO */}
      {inmueble && (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <FormularioInmueble
            initialData={inmueble}
            submitHandler={handleUpdate}
            submitLabel="Actualizar Inmueble"
            onCancel={handleCancel}
          />
        </div>
      )}
    </main>

    {/* 🧩 MODAL DE ÉXITO / ERROR */}
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      title={modalConfig.title}
      message={modalConfig.message}
      variant={modalConfig.variant}
      onConfirm={modalConfig.onConfirm}
    />
  </div>
);
}