"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import type { InmuebleDTO } from "@/types/inmuebles";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  inmueble: InmuebleDTO;
}

export default function InmuebleCard({ inmueble }: Props) {
  // 🩵 Ordenar imágenes: principal primero
  const orderedImages = useMemo(() => {
    if (!inmueble.imagenes?.length) return [];
    return [...inmueble.imagenes].sort((a, b) =>
      a.principal === b.principal ? 0 : a.principal ? -1 : 1
    );
  }, [inmueble.imagenes]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = orderedImages.map((img) => img.url);

  const handlePrevImage = () =>
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : images.length - 1
    );

  const handleNextImage = () =>
    setCurrentImageIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : 0
    );

  const direccion = inmueble.ubicacion?.direccion ?? "Desconocida";
  const barrio = inmueble.ubicacion?.barrio?.nombre ?? "Desconocido";
  const ciudad = inmueble.ubicacion?.ciudad ?? "Desconocida";
  const provincia = inmueble.ubicacion?.provincia ?? "Desconocida";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-100 p-6 rounded-xl shadow-md">
      {/* 🖼 Galería */}
      <div className="relative w-full md:col-span-2 h-80 md:h-96 rounded-md overflow-hidden">
        <Image
          src={images[currentImageIndex] || "/placeholder.jpg"}
          alt={inmueble.tipo_inmueble?.nombre || "Imagen de inmueble"}
          fill
          className="object-cover"
        />

        {images.length > 1 && (
          <>
           <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

            {/* Indicadores */}
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

      {/* 📄 Detalles */}
      <div className="bg-white p-4 rounded-md flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            {inmueble.tipo_inmueble?.nombre} en {barrio}
          </h2>

          <p className="text-gray-700 mb-2">
            {inmueble.detalles || "Sin descripción disponible."}
          </p>

          <p className="text-gray-700 mt-1">
            Dirección: {direccion}, {ciudad}, {provincia}
          </p>

          <p className="text-gray-700 mt-1">
            Superficie Total: {inmueble.superficie_total} m² | Cubierta:{" "}
            {inmueble.superficie_cubierta ?? "N/A"} m²
          </p>

          <p className="text-gray-700 mt-1">
            Baños: {inmueble.cantidad_banos ?? "N/A"} | Dormitorios:{" "}
            {inmueble.cantidad_dormitorios ?? "N/A"} | Cocheras:{" "}
            {inmueble.cantidad_cocheras ?? "N/A"} | Pisos:{" "}
            {inmueble.cantidad_pisos ?? "N/A"}
          </p>

          <p className="text-gray-700 mt-1">
            Antigüedad: {inmueble.antiguedad ?? "N/A"} años
          </p>

          <p className="text-gray-700 mt-1 font-semibold">
            Precio: ${inmueble.precio?.toLocaleString() || "N/A"}
          </p>
        </div>

        {/* Contacto siempre igual */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Contacto</h3>
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
    </div>
  );
}
