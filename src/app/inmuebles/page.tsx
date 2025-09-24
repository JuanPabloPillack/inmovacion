"use client";

import { useState, useEffect } from "react";
import InmuebleCard from "@/components/InmuebleCard";
import { InmuebleDTO } from "../../../types/inmuebles";

export default function HomePage() {
  const [inmuebles, setInmuebles] = useState<InmuebleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const res = await fetch("/api/inmuebles");
        if (!res.ok) throw new Error("Error al obtener inmuebles");
        const data: InmuebleDTO[] = await res.json();
        setInmuebles(data);
      } catch (error) {
        console.error("❌ Error en fetchInmuebles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInmuebles();
  }, []);

  if (loading) return <p className="text-center">Cargando inmuebles...</p>;
  if (!inmuebles.length) return <p className="text-center">No hay inmuebles disponibles.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {inmuebles.map((inmueble) => (
        <InmuebleCard key={inmueble.id_inmueble} inmueble={inmueble} />
      ))}
    </div>
  );
}
