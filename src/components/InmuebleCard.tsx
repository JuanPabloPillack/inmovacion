"use client";

import Image from "next/image";
import { useState } from "react";
import type { InmuebleDTO } from "@/types/inmuebles";

interface Props {
  inmueble: InmuebleDTO;
}

export default function InmuebleCard({ inmueble }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = inmueble.imagenes.map((img) => img.url);

  const handlePrevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev > 0 ? prev - 1 : images.length - 1)
    );
  const handleNextImage = () =>
    setCurrentImageIndex(
      (prev) => (prev < images.length - 1 ? prev + 1 : 0)
    );

  const localidad =
    inmueble.ubicacion.barrio?.localidad?.nombre ?? "Ubicación desconocida";
  const metrosCuadrados = inmueble.superficie_cubierta
    ? `${inmueble.superficie_cubierta} m²`
    : inmueble.superficie_total
    ? `${inmueble.superficie_total} m²`
    : "N/A";
  const ambientes = inmueble.cantidad_ambientes
    ? `${inmueble.cantidad_ambientes} Ambientes`
    : "N/A";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-100 p-4 rounded-xl shadow-md">
      {/* Galería */}
      <div className="relative w-full h-64 md:h-48 rounded-md overflow-hidden">
        <Image
          src={images[currentImageIndex] || "/placeholder.jpg"}
          alt={inmueble.tipo_inmueble.nombre}
          fill
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ←
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              →
            </button>

            {/* Indicadores de imagen */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detalles */}
      <div className="bg-white p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">
          {inmueble.tipo_inmueble.nombre} en {localidad}
        </h2>
        <p className="text-gray-700">
          {inmueble.detalles || "Sin descripción disponible."}
        </p>
        <p className="text-gray-700 mt-2">
          Superficie: {metrosCuadrados} | {ambientes}
        </p>
        <p className="text-gray-700 mt-2">
          Precio: ${inmueble.precio?.toLocaleString() || "N/A"}
        </p>
      </div>

      {/* Contacto */}
      <div className="bg-white p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Contacto</h2>
        <p className="text-gray-700 flex items-center">
          <span className="mr-2">📞</span> +54 343-6205284
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
  );
}
