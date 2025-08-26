"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { InmuebleDTO } from "@/types/inmuebles";

interface Props {
  inmueble: InmuebleDTO;
}

export default function InmuebleCard({ inmueble }: Props) {
  const tipo = inmueble.tipo_inmueble?.nombre ?? "Tipo desconocido";
  const localidad =
    inmueble.ubicacion?.barrio?.localidad?.nombre ?? "Ubicación desconocida";

  // Usa directamente la foto principal enviada por el backend
  const [foto, setFoto] = useState<string>(
    inmueble.fotoPrincipal || inmueble.foto || "/placeholder.jpg"
  );
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Subir a Cloudinary
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Error al subir imagen a Cloudinary");

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;
      setFoto(imageUrl);

      // Guardar la imagen en la BD (ajusta si usas otro endpoint)
      const saveRes = await fetch("/api/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addImage",
          inmuebleId: inmueble.id_inmueble,
          url: imageUrl,
        }),
      });

      if (!saveRes.ok) throw new Error("Error al guardar la imagen en BD");

      alert("✅ Imagen subida y guardada correctamente!");
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir la imagen. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inmueble-card bg-white border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Imagen */}
      <div className="relative h-48 w-full">
        <Image
          src={foto}
          alt={tipo}
          fill
          className="object-cover"
          onError={() => setFoto("/placeholder.jpg")}
        />
      </div>

      {/* Información */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">
          {tipo} en {localidad}
        </h3>

        <p className="text-gray-700">
          Precio:{" "}
          <span className="font-bold">
            {inmueble.precio != null ? `$${inmueble.precio.toLocaleString()}` : "N/A"}
          </span>
        </p>

        {inmueble.detalles && (
          <p className="text-sm text-gray-500">{inmueble.detalles}</p>
        )}

        <Link
          href={`/inmuebles/${inmueble.id_inmueble}`}
          className="inline-block mt-2 text-blue-600 hover:underline"
        >
          Ver detalle →
        </Link>

        {/* Upload nueva foto */}
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cambiar foto del inmueble:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="border rounded p-1 w-full"
          />
          {loading && (
            <p className="text-sm text-gray-500 mt-1">Subiendo imagen...</p>
          )}
        </div>
      </div>
    </div>
  );
}
