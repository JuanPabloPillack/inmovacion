/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InmuebleDTO } from "@/types/inmuebles";

export default function InmueblePage() {
  const { id } = useParams();
  const [inmueble, setInmueble] = useState<InmuebleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInmueble = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/inmuebles/${id}`);
        if (!res.ok) throw new Error("Inmueble no encontrado");
        const data: InmuebleDTO = await res.json();
        setInmueble(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInmueble();
  }, [id]);

  if (loading) return <p className="text-center">Cargando inmueble...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!inmueble) return <p className="text-center">Inmueble no disponible</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{inmueble.tipo_inmueble.nombre}</h1>
      <p className="text-gray-600 mb-2">Estado: {inmueble.estado.nombre}</p>
      <p className="text-gray-600 mb-2">Precio: ${inmueble.precio}</p>
      <p className="text-gray-600 mb-2">Superficie total: {inmueble.superficie_total} m²</p>
      <p className="text-gray-600 mb-2">Superficie cubierta: {inmueble.superficie_cubierta ?? "-"} m²</p>
      <p className="text-gray-600 mb-2">Ambientes: {inmueble.cantidad_ambientes ?? "-"}</p>
      <p className="text-gray-600 mb-2">Antigüedad: {inmueble.antiguedad ?? "-"} años</p>
      <p className="text-gray-600 mb-4">Dirección: {inmueble.ubicacion.direccion}</p>
      <p className="text-gray-800 mb-4">{inmueble.detalles}</p>

      <div className="grid grid-cols-2 gap-4">
        {inmueble.imagenes.map((img) => (
          <img key={img.id} src={img.url} alt="Imagen inmueble" className="w-full h-48 object-cover rounded-md" />
        ))}
      </div>
    </div>
  );
}
