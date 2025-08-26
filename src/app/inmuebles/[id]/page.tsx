"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Inmueble } from "@/types/inmuebles";

export default function InmuebleDetalle() {
  const params = useParams();
  const { id } = params as { id: string };
  const [inmueble, setInmueble] = useState<Inmueble | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInmueble() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/inmuebles/${id}`);
        if (!res.ok) {
          setError(`Inmueble no encontrado (status ${res.status})`);
          setInmueble(null);
          return;
        }
        const data: Inmueble = await res.json();
        setInmueble(data);
      } catch (err) {
        console.error(err);
        setError("Error al obtener el inmueble");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchInmueble();
  }, [id]);

  if (loading) return <p>Cargando inmueble...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!inmueble) return <p>Inmueble no encontrado.</p>;

  const fotoPrincipal = inmueble.fotoPrincipal || inmueble.imagenes?.[0]?.url || "/placeholder.jpg";

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {inmueble.tipo_inmueble?.nombre || "Tipo desconocido"}
      </h1>

      <p className="mb-2">
        Precio:{" "}
        <span className="font-bold">
          {inmueble.precio != null ? `$${inmueble.precio.toLocaleString()}` : "N/A"}
        </span>
      </p>

      <p className="mb-2">
        Ubicación: {inmueble.ubicacion?.barrio?.localidad?.nombre || "Desconocida"}
      </p>

      <p className="mb-4">{inmueble.detalles || "Sin detalles"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Image
          src={fotoPrincipal}
          alt="Foto principal del inmueble"
          width={500}
          height={300}
          className="object-cover rounded"
        />
        {inmueble.imagenes
          ?.filter((img) => img.url !== inmueble.fotoPrincipal)
          .map((img) => (
            <Image
              key={img.id}
              src={img.url || "/placeholder.jpg"}
              alt="Imagen adicional"
              width={500}
              height={300}
              className="object-cover rounded"
            />
          ))}
      </div>
    </div>
  );
}
