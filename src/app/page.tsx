/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Filtros from "../components/Filtros";
import InmuebleCard from "../components/InmuebleCard";
import { InmuebleDTO } from "@/types/inmuebles";
import { FiltrosInmueble } from "@/types/filtros";

export default function HomePage() {
  const [filtros, setFiltros] = useState<FiltrosInmueble>({
    localidad: "",
    tipo: "",
    operacion: "",
    precioMin: "",
    precioMax: "",
  });

  const [inmuebles, setInmuebles] = useState<InmuebleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buscarInmuebles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inmuebles");
      if (!res.ok) throw new Error("Error al obtener inmuebles");
      const data: InmuebleDTO[] = await res.json();
      setInmuebles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarInmuebles();
  }, []);

  if (loading) return <p className="text-center">Cargando inmuebles...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="p-0">
      <Filtros filtros={filtros} setFiltros={setFiltros} onApply={buscarInmuebles} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {inmuebles.length === 0 ? (
          <p className="text-center text-gray-600">No hay resultados disponibles.</p>
        ) : (
          inmuebles.map((inmueble) => (
            <InmuebleCard key={inmueble.id_inmueble} inmueble={inmueble} />
          ))
        )}
      </div>
    </section>
  );
}
