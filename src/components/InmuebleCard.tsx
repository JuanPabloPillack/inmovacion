// src/components/InmuebleCard.tsx
"use client";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import type { InmuebleDTO } from "@/types/inmuebles";
import type { FiltrosInmueble } from "@/types/filtros";
import {
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Car,
  Ruler,
  MapPin,
  Clock,
  Home,
  Phone,
} from "lucide-react";

interface Props {
  inmueble: InmuebleDTO;
  filtrosAplicados?: FiltrosInmueble;
}

export default function InmuebleCard({ inmueble, filtrosAplicados }: Props) {
  const orderedImages = useMemo(() => {
    if (!inmueble.imagenes?.length) return [];
    return [...inmueble.imagenes].sort((a, b) =>
      a.principal === b.principal ? 0 : a.principal ? -1 : 1
    );
  }, [inmueble.imagenes]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = orderedImages.slice(0, 10).map((img) => img.url);
  const hasImages = images.length > 0;

  const handlePrev = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const precioFormatted = inmueble.precio
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(inmueble.precio)
    : "Consultar precio";

  const ubicacionPartes = [
    inmueble.ubicacion?.direccion?.trim(),
    inmueble.ubicacion?.barrio?.nombre?.trim(),
    inmueble.ubicacion?.barrio?.localidad?.nombre?.trim(),
    inmueble.ubicacion?.provincia?.trim(),
  ].filter(Boolean);

  const ubicacionTexto = ubicacionPartes.join(", ");

  const pluralizar = (cantidad: number | null | undefined, singular: string, plural: string) => {
    if (cantidad == null || cantidad <= 0) return "";
    return cantidad === 1 ? singular : plural;
  };

  // ── Condiciones estrictas: solo mostrar si tiene valor útil (>0 o string no vacío)
  const showSuperficieTotal = !!inmueble.superficie_total && inmueble.superficie_total > 0;
  const showSuperficieCubierta = !!inmueble.superficie_cubierta && inmueble.superficie_cubierta > 0;
  const showDormitorios = !!inmueble.cantidad_dormitorios && inmueble.cantidad_dormitorios > 0;
  const showBanos = !!inmueble.cantidad_banos && inmueble.cantidad_banos > 0;
  const showAntiguedad = !!inmueble.antiguedad && inmueble.antiguedad > 0;
  const showCocheras = !!inmueble.cantidad_cocheras && inmueble.cantidad_cocheras > 0;
  const showDetalles = !!inmueble.detalles && inmueble.detalles.trim().length > 0;

  // ── Determinar si hay alguna característica para mostrar
  const hasCaracteristicas =
    showSuperficieTotal ||
    showSuperficieCubierta ||
    showDormitorios ||
    showBanos;

  return (
    <div
      className="
        group relative bg-white rounded-2xl shadow-md overflow-hidden 
        border border-gray-200 hover:shadow-xl hover:border-[#63bae9]/40 
        transition-all duration-300
      "
    >
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-full">
        {/* IMAGEN */}
        <div className="relative h-72 lg:h-auto overflow-hidden">
          <Image
            src={images[currentImageIndex] || inmueble.fotoPrincipal || "/placeholder-large.jpg"}
            alt={inmueble.titulo || "Propiedad inmobiliaria"}
            fill
            priority={currentImageIndex === 0}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />

          {hasImages && images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-gray-800 p-3 rounded-full shadow-lg hover:bg-[#63bae9] hover:text-white transition-all duration-200 opacity-80 hover:opacity-100"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-gray-800 p-3 rounded-full shadow-lg hover:bg-[#63bae9] hover:text-white transition-all duration-200 opacity-80 hover:opacity-100"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex ? "bg-[#63bae9] scale-125 shadow-md" : "bg-white/80 hover:bg-white"
                    }`}
                    aria-label={`Ir a imagen ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="p-6 lg:p-8 flex flex-col gap-4 lg:gap-5">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 group-hover:text-[#63bae9] transition-colors line-clamp-2 mb-2">
              {inmueble.titulo || "Sin título"}
            </h2>

            {ubicacionTexto ? (
              <div className="flex items-start gap-2 text-gray-600 text-sm leading-tight">
                <MapPin className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{ubicacionTexto}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5" />
                Ubicación no especificada
              </div>
            )}
          </div>

          {/* DETALLES */}
          {showDetalles && (
            <div className="text-sm text-gray-700 leading-relaxed line-clamp-5">
              {inmueble.detalles}
            </div>
          )}

          {/* PRECIO */}
          <div className="text-3xl lg:text-4xl font-extrabold text-[#63bae9] tracking-tight flex items-baseline gap-2">
            {precioFormatted}
            <span className="text-xl font-normal text-gray-500">USD</span>
          </div>

          {/* Características – solo si hay algo que mostrar */}
          {hasCaracteristicas && (
            <div className="grid grid-cols-4 gap-5 py-5 border-y border-gray-100 text-center">
              {showSuperficieTotal && (
                <div>
                  <Ruler className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-semibold text-lg">{inmueble.superficie_total} m²</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total</div>
                </div>
              )}

              {showSuperficieCubierta && (
                <div>
                  <Home className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-semibold text-lg">{inmueble.superficie_cubierta} m²</div>
                  <div className="text-xs text-gray-500 mt-0.5">Cubierta</div>
                </div>
              )}

              {showDormitorios && (
                <div>
                  <BedDouble className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-semibold text-lg">{inmueble.cantidad_dormitorios}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Dorm.</div>
                </div>
              )}

              {showBanos && (
                <div>
                  <Bath className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-semibold text-lg">{inmueble.cantidad_banos}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {pluralizar(inmueble.cantidad_banos, "Baño", "Baños")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info adicional – solo si hay antigüedad o cocheras */}
          {(showAntiguedad || showCocheras) && (
            <div className="space-y-3 text-sm text-gray-700 mt-auto">
              {showAntiguedad && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Antigüedad: {inmueble.antiguedad} años</span>
                </div>
              )}

              {showCocheras && (
                <div className="flex items-center gap-2.5">
                  <Car className="w-5 h-5 text-gray-500" />
                  <span>
                    {inmueble.cantidad_cocheras}{" "}
                    {pluralizar(inmueble.cantidad_cocheras, "cochera", "cocheras")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contacto */}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#63bae9]/10 flex items-center justify-center text-[#63bae9] font-bold">
                  GB
                </div>
                <div>
                  <p className="font-medium text-gray-800">GBS y Asociados</p>
                  <a
                    href="https://instagram.com/gbsyasociados"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#63bae9] hover:underline text-xs"
                  >
                    @gbsyasociados
                  </a>
                </div>
              </div>

              <a
                href="tel:+543436205284"
                className="flex items-center gap-2 text-gray-700 hover:text-[#63bae9] hover:underline transition-all duration-200"
              >
                <Phone className="w-5 h-5 text-gray-500" />
                +54 343 6205284
              </a>
            </div>
          </div>

          {/* Filtros aplicados */}
          {filtrosAplicados && Object.values(filtrosAplicados).some(Boolean) && (
            <div className="pt-3">
              <p className="text-xs text-gray-500 mb-2">Filtros:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filtrosAplicados).map(
                  ([k, v]) =>
                    v && (
                      <span
                        key={k}
                        className="px-3 py-1 bg-[#63bae9]/10 text-[#63bae9] text-xs rounded-full border border-[#63bae9]/20"
                      >
                        {k}: {v}
                      </span>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}