"use client";

import { useState, useEffect } from "react";
import InmuebleCard from "@/components/InmuebleCard";
import { InmuebleDTO } from "@/types/inmuebles";

export default function InmueblesPage() {
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInmuebles();
  }, []);

  if (loading) return <p>Cargando inmuebles...</p>;
  if (!inmuebles.length) return <p>No hay inmuebles disponibles.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {inmuebles.map((inmueble) => (
        <InmuebleCard key={inmueble.id_inmueble} inmueble={inmueble} />
      ))}
    </div>
  );
}