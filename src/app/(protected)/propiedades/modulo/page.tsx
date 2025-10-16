"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InmuebleDTO } from "@/types/inmuebles";
import InmuebleCard from "@/components/InmuebleCard";
import Header from "@/components/ui/Header";

interface InmuebleLocal extends InmuebleDTO {
  archivadoLocal: boolean;
}

export default function ModuloPropiedadesPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // 🔹 Estados para la paginación
  const [paginaActivos, setPaginaActivos] = useState(1);
  const [paginaArchivados, setPaginaArchivados] = useState(1);
  const inmueblesPorPagina = 5;

  const fetchInmuebles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inmuebles/modulo");
      if (!res.ok) throw new Error("Error al obtener datos");
      const data: InmuebleDTO[] = await res.json();

      const inmueblesConEstado: InmuebleLocal[] = data.map((i) => ({
        ...i,
        archivadoLocal: i.archivado ?? false,
      }));

      setInmuebles(inmueblesConEstado);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los inmuebles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInmuebles();
  }, []);

  const handleModificar = (id: number) => {
    router.push(`/propiedades/modificar/${id}`);
  };

  const handleCrear = () => {
    router.push("/propiedades/nuevo");
  };

  const toggleArchivar = async (id: number, archivado: boolean) => {
    try {
      const res = await fetch(`/api/inmuebles/${id}/archivar`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("No se pudo actualizar");

      setInmuebles((prev) =>
        prev.map((i) =>
          i.id_inmueble === id ? { ...i, archivadoLocal: !archivado } : i
        )
      );
    } catch (error) {
      console.error("Error al actualizar el inmueble", error);
      setError("No se pudo actualizar el inmueble");
    }
  };

  // 🔹 Filtrar activos y archivados
  const activos = inmuebles.filter((i) => !i.archivadoLocal);
  const archivados = inmuebles.filter((i) => i.archivadoLocal);

  // 🔹 Calcular límites de paginación
  const indexUltimoActivo = paginaActivos * inmueblesPorPagina;
  const indexPrimeroActivo = indexUltimoActivo - inmueblesPorPagina;
  const activosPagina = activos.slice(indexPrimeroActivo, indexUltimoActivo);

  const indexUltimoArchivado = paginaArchivados * inmueblesPorPagina;
  const indexPrimeroArchivado = indexUltimoArchivado - inmueblesPorPagina;
  const archivadosPagina = archivados.slice(indexPrimeroArchivado, indexUltimoArchivado);

  const totalPaginasActivos = Math.ceil(activos.length / inmueblesPorPagina);
  const totalPaginasArchivados = Math.ceil(archivados.length / inmueblesPorPagina);

  const cambiarPaginaActivos = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasActivos) {
      setPaginaActivos(nuevaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cambiarPaginaArchivados = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasArchivados) {
      setPaginaArchivados(nuevaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
          {/* Header */}
          <Header />
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Propiedades
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            🏡 <strong>{inmuebles.length}</strong> inmuebles
          </span>
          <button
            onClick={handleCrear}
            className="flex items-center gap-2 bg-[#63bae9] hover:bg-[#4aa3cf] text-white px-4 py-2 rounded-lg transition"
          >
            <PlusCircle size={20} />
            Crear Propiedad
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto py-10 px-4 space-y-10">
        {loading ? (
          <p className="text-center">⏳ Cargando inmuebles...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : inmuebles.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay inmuebles registrados.
          </p>
        ) : (
          <>
            {/* 🟢 Sección de Activos */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-green-700">
                Inmuebles Disponibles
              </h2>
              {activos.length === 0 ? (
                <p className="text-gray-500">No hay inmuebles activos.</p>
              ) : (
                <>
                  {activosPagina.map((inmueble) => (
                    <div
                      key={inmueble.id_inmueble}
                      className="border rounded-lg shadow-sm p-4 bg-white mb-4"
                    >
                      <div className="mb-2">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800">
                          Disponible
                        </span>
                      </div>
                      <InmuebleCard inmueble={inmueble} />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() =>
                            toggleArchivar(inmueble.id_inmueble, inmueble.archivadoLocal)
                          }
                          className="px-4 py-2 rounded-md transition text-gray-800 bg-red-300 hover:bg-red-400"
                        >
                          Archivar
                        </button>
                        <button
                          onClick={() => handleModificar(inmueble.id_inmueble)}
                          className="px-4 py-2 rounded-md transition text-white bg-blue-500 hover:bg-blue-600"
                        >
                          Modificar
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 🔹 Paginación Activos */}
                  {totalPaginasActivos > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-6">
                      <button
                        onClick={() => cambiarPaginaActivos(paginaActivos - 1)}
                        disabled={paginaActivos === 1}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      >
                        ← Anterior
                      </button>

                      {[...Array(totalPaginasActivos)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => cambiarPaginaActivos(index + 1)}
                          className={`px-3 py-2 rounded-lg ${
                            paginaActivos === index + 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => cambiarPaginaActivos(paginaActivos + 1)}
                        disabled={paginaActivos === totalPaginasActivos}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* 🔴 Sección de Archivados */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-red-700">
                Inmuebles Archivados
              </h2>
              {archivados.length === 0 ? (
                <p className="text-gray-500">No hay inmuebles archivados.</p>
              ) : (
                <>
                  {archivadosPagina.map((inmueble) => (
                    <div
                      key={inmueble.id_inmueble}
                      className="border rounded-lg shadow-sm p-4 bg-white mb-4"
                    >
                      <div className="mb-2">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-200 text-red-800">
                          Archivado
                        </span>
                      </div>
                      <InmuebleCard inmueble={inmueble} />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() =>
                            toggleArchivar(inmueble.id_inmueble, inmueble.archivadoLocal)
                          }
                          className="px-4 py-2 rounded-md transition text-white bg-green-500 hover:bg-green-600"
                        >
                          Activar
                        </button>
                        <button
                          onClick={() => handleModificar(inmueble.id_inmueble)}
                          className="px-4 py-2 rounded-md transition text-white bg-blue-500 hover:bg-blue-600"
                        >
                          Modificar
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 🔹 Paginación Archivados */}
                  {totalPaginasArchivados > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-6">
                      <button
                        onClick={() => cambiarPaginaArchivados(paginaArchivados - 1)}
                        disabled={paginaArchivados === 1}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      >
                        ← Anterior
                      </button>

                      {[...Array(totalPaginasArchivados)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => cambiarPaginaArchivados(index + 1)}
                          className={`px-3 py-2 rounded-lg ${
                            paginaArchivados === index + 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => cambiarPaginaArchivados(paginaArchivados + 1)}
                        disabled={paginaArchivados === totalPaginasArchivados}
                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#63bae9] text-white py-6 text-center mt-auto">
        <p className="text-sm">
          © 2025 Inmovación - GBS y Asociados. Todos los derechos reservados.
        </p>
      </footer>
    </div>
    </div>
  );
}
