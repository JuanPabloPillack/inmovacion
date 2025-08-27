"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { InmuebleDTO } from "@/types/inmuebles";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function InmuebleDetalle() {
  const params = useParams();
  const { id } = params as { id: string };
  const [inmueble, setInmueble] = useState<InmuebleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

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
        const data: InmuebleDTO = await res.json();
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

  // fotos
  const fotos = inmueble.imagenes?.map((img) => img.url) || ["/placeholder.jpg"];
  const fotoActual = fotos[currentIndex];

  const nextFoto = () => setCurrentIndex((prev) => (prev + 1) % fotos.length);
  const prevFoto = () => setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length);

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Título */}
      <h1 className="text-3xl font-bold mb-4 text-center">
        {inmueble.tipo_inmueble?.nombre} – {inmueble.ubicacion?.direccion}
      </h1>

      {/* Carrusel */}
      <div className="relative w-full h-[400px] flex justify-center items-center bg-gray-100 rounded overflow-hidden">
        <button
          onClick={prevFoto}
          className="absolute left-2 bg-white p-2 rounded-full shadow"
        >
          ←
        </button>
        <Image
          src={fotoActual}
          alt="Foto del inmueble"
          width={800}
          height={400}
          className="object-cover rounded"
        />
        <button
          onClick={nextFoto}
          className="absolute right-2 bg-white p-2 rounded-full shadow"
        >
          →
        </button>
      </div>

      {/* Descripción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2 bg-gray-100 p-4 rounded shadow">
          <h2 className="font-bold text-xl mb-2">Descripción</h2>
          <p className="mb-2">
            Alquiler departamento {inmueble.cantidad_ambientes || "N/A"} ambientes.
          </p>
          <p>{inmueble.detalles || "Sin detalles adicionales"}</p>
        </div>

        {/* Contacto */}
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="font-bold text-xl mb-2">Contacto</h2>
          <p className="flex items-center gap-2 mb-2">
            <FaWhatsapp className="text-green-500" /> +54 343-6205284
          </p>
          <p className="flex items-center gap-2">
            <FaInstagram className="text-pink-500" /> gbsyasociados
          </p>
        </div>
      </div>
    </div>
  );
}
