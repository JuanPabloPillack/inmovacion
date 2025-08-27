"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { InmuebleDTO } from "@/types/inmuebles";

interface Props {
  inmueble: InmuebleDTO;
}

export default function InmuebleCard({ inmueble }: Props) {
  const tipo = inmueble.tipo_inmueble.nombre || "Tipo desconocido";
  const localidad =
    inmueble.ubicacion.barrio?.localidad?.nombre ?? "Ubicación desconocida";
  const estado = inmueble.estado === "venta" ? "Venta" : "Alquiler";

  // Use actual fields from InmuebleDTO
  const metrosCuadrados = inmueble.superficie_cubierta
    ? `${inmueble.superficie_cubierta} m²`
    : inmueble.superficie_total
    ? `${inmueble.superficie_total} m²`
    : "N/A";
  const ambientes = inmueble.cantidad_ambientes
    ? `${inmueble.cantidad_ambientes} Ambientes`
    : "N/A";

  const [foto, setFoto] = useState<string>(
    inmueble.imagenes.find((img) => img.principal)?.url ||
    inmueble.fotoPrincipal ||
    inmueble.foto ||
    "/placeholder.jpg"
  );
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Error al subir imagen");

      const uploadData = await uploadRes.json();
      setFoto(uploadData.url);

      const saveRes = await fetch("/api/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addImage",
          inmuebleId: inmueble.id_inmueble,
          url: uploadData.url,
          principal: !inmueble.imagenes.some((img) => img.principal), // Set as principal if no principal exists
        }),
      });
      if (!saveRes.ok) throw new Error("Error al guardar imagen");

      alert("✅ Imagen subida correctamente!");
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inmueble-card bg-gray-200 p-4 rounded-xl shadow-md flex flex-col md:flex-row items-center">
      <div className="relative w-full md:w-1/2 h-48">
        <Image
          src={foto}
          alt={tipo}
          fill
          className="object-cover rounded-lg"
          onError={() => setFoto("/placeholder.jpg")}
        />
      </div>
      <div className="md:ml-4 mt-4 md:mt-0 w-full md:w-1/2 space-y-2">
        <h3 className="text-xl font-bold">
          {tipo} {localidad && `en ${localidad}`}
        </h3>
        <p className="text-gray-600">{metrosCuadrados}</p>
        <p className="text-gray-600">{ambientes}</p>
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
          className="filter-tag info inline-block mt-2 text-black hover:bg-yellow-500"
        >
          Más información
        </Link>
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