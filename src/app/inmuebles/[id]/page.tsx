/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { InmuebleDTO } from "@/types/inmuebles";

export default function InmueblePage() {
  const { id } = useParams();
  const [inmueble, setInmueble] = useState<InmuebleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const images = inmueble.imagenes.map((img) => img.url);
  const handlePrevImage = () =>
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  const handleNextImage = () =>
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));

  const localidad = inmueble.ubicacion.barrio?.localidad?.nombre || "Ubicación desconocida";
  const metrosCuadrados = inmueble.superficie_cubierta
    ? `${inmueble.superficie_cubierta} m²`
    : inmueble.superficie_total
    ? `${inmueble.superficie_total} m²`
    : "N/A";
  const ambientes = inmueble.cantidad_ambientes
    ? `${inmueble.cantidad_ambientes} Ambientes`
    : "N/A";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {inmueble.tipo_inmueble.nombre} en {localidad}
      </h1>

      {/* Three-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <div className="relative">
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
          >
            ←
          </button>
          <Image
            src={images[currentImageIndex] || "/placeholder.jpg"}
            alt={inmueble.tipo_inmueble.nombre}
            width={400}
            height={300}
            className="w-full h-auto object-cover rounded-md"
            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
          />
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
          >
            →
          </button>
        </div>

        {/* Description */}
        <div className="bg-gray-200 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Descripción</h2>
          <p className="text-gray-700">
            {inmueble.detalles ||
              "Departamento de excelente calidad constructiva, ambientes amplios, luminosos y ventilados."}
          </p>
          <p className="text-gray-700 mt-2">
            Superficie: {metrosCuadrados} | {ambientes}
          </p>
          <p className="text-gray-700 mt-2">
            Precio: ${inmueble.precio?.toLocaleString() || "N/A"}
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gray-200 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Contacto</h2>
          <p className="text-gray-700">
            <span className="flex items-center">
              <span className="mr-2">📞</span> +54 343-6205284
            </span>
          </p>
          <p className="text-gray-700 mt-2 flex items-center">
            <span className="mr-2">📷</span>
            <a
              href="https://instagram.com/gbsyasociados"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              gbsyasociados
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}