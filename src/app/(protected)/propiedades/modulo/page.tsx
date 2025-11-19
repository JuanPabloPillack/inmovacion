'use client';
import { useEffect, useState } from 'react';
import { Home, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import InmuebleCard from '@/components/InmuebleCard';
import Filtros from '@/components/Filtros'; // ✅ Componente de filtros
import toast, { Toaster } from 'react-hot-toast';
import type { InmuebleDTO } from '@/types/inmuebles';
import type { FiltrosInmueble } from '@/types/filtros'; // ✅ Tipos de filtros

interface InmuebleLocal extends InmuebleDTO {
  archivadoLocal: boolean;
}

export default function PropiedadesPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginaActivos, setPaginaActivos] = useState(1);
  const [paginaArchivados, setPaginaArchivados] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosInmueble>({});
  const inmueblesPorPagina = 5;
  const router = useRouter();

  const fetchInmuebles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inmuebles/modulo');
      if (!res.ok) throw new Error('Error al obtener los inmuebles');
      const data: InmuebleDTO[] = await res.json();
      const inmueblesConEstado: InmuebleLocal[] = data.map((i) => ({
        ...i,
        archivadoLocal: i.archivado ?? false,
      }));
      setInmuebles(inmueblesConEstado);
    } catch {
      setError('No se pudieron cargar los inmuebles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInmuebles();
  }, []);

  const handleCrear = () => router.push('/propiedades/nuevo');
  const handleModificar = (id: number) => router.push(`/propiedades/modificar/${id}`);

  const toggleArchivar = async (id: number, archivado: boolean) => {
    try {
      const res = await fetch(`/api/inmuebles/${id}/archivar`, { method: 'PUT' });
      if (!res.ok) throw new Error('Error al actualizar');
      setInmuebles((prev) =>
        prev.map((i) =>
          i.id_inmueble === id ? { ...i, archivadoLocal: !archivado } : i
        )
      );
      toast.success(
        archivado ? 'Propiedad reactivada correctamente' : 'Propiedad archivada'
      );
    } catch {
      setError('No se pudo actualizar el inmueble');
      toast.error('Error al actualizar el inmueble');
    }
  };

  // ✅ Eliminar solo si está archivado
  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/inmuebles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setInmuebles((prev) => prev.filter((i) => i.id_inmueble !== id));
      toast.success('Propiedad eliminada correctamente');
    } catch {
      toast.error('Error al eliminar la propiedad');
    }
  };

  // ✅ Filtrado en memoria
  const inmueblesFiltrados = inmuebles.filter((i) => {
    if (filtros.estadoId && i.id_estado !== filtros.estadoId) return false;
    if (filtros.tipoId && i.id_tipo_inmueble !== filtros.tipoId) return false;
    if (filtros.precioMin) {
      const min = Number(filtros.precioMin);
      if (i.precio == null || i.precio < min) return false;
    }
    if (filtros.precioMax) {
      const max = Number(filtros.precioMax);
      if (i.precio == null || i.precio > max) return false;
    }
    return true;
  });

  const activos = inmueblesFiltrados.filter((i) => !i.archivadoLocal);
  const archivados = inmueblesFiltrados.filter((i) => i.archivadoLocal);

  const paginar = (array: InmuebleLocal[], pagina: number) => {
    const inicio = (pagina - 1) * inmueblesPorPagina;
    return array.slice(inicio, inicio + inmueblesPorPagina);
  };

  const activosPagina = paginar(activos, paginaActivos);
  const archivadosPagina = paginar(archivados, paginaArchivados);
  const totalPaginasActivos = Math.ceil(activos.length / inmueblesPorPagina);
  const totalPaginasArchivados = Math.ceil(archivados.length / inmueblesPorPagina);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />

      {/* Encabezado */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#63bae9]">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Gestión de Propiedades</h1>
              <p className="text-sm mt-1 text-gray-500">
                Administra y controla los inmuebles registrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#fef9e7]">
            <div className="w-2 h-2 rounded-full animate-pulse bg-[#fcc238]" />
            <span className="text-sm font-medium text-gray-600">
              {inmuebles.length} {inmuebles.length === 1 ? 'propiedad' : 'propiedades'}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 shadow-sm bg-[#fef9e7] border-l-4 border-[#fcc238]">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-500" />
            <p className="font-medium text-gray-600">{error}</p>
          </div>
        )}

        {/* Botón alta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleCrear}
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-[#63bae9]"
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Registrar Propiedad</div>
              <div className="text-sm opacity-90">Agrega un nuevo inmueble</div>
            </div>
          </button>
        </div>

        {/* 🔹 Filtros */}
        <Filtros
          filtros={filtros}
          setFiltros={setFiltros}
          onApply={() => {
            setPaginaActivos(1);
            setPaginaArchivados(1);
          }}
        />

        {/* Listado de activos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700">Inmuebles Activos</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-[#63bae9]" />
                <p className="mt-4 text-lg font-medium text-gray-400">
                  Cargando inmuebles...
                </p>
              </div>
            ) : activos.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  No hay inmuebles activos
                </h3>
              </div>
            ) : (
              <div className="grid gap-4">
                {activosPagina.map((i) => (
                  <div
                    key={i.id_inmueble}
                    className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all relative border-l-4 border-l-[#63bae9]"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {i.estado?.nombre && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          {i.estado.nombre}
                        </span>
                      )}
                      {i.operacion?.nombre && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {i.operacion.nombre}
                        </span>
                      )}
                    </div>

                    <InmuebleCard inmueble={i} />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => toggleArchivar(i.id_inmueble, i.archivadoLocal)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Archivar
                      </button>
                      <button
                        onClick={() => handleModificar(i.id_inmueble)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        Modificar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación Activos */}
            {totalPaginasActivos > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setPaginaActivos((p) => Math.max(p - 1, 1))}
                  disabled={paginaActivos === 1}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                {[...Array(totalPaginasActivos)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPaginaActivos(index + 1)}
                    className={`px-3 py-2 rounded-lg ${
                      paginaActivos === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPaginaActivos((p) => Math.min(p + 1, totalPaginasActivos))
                  }
                  disabled={paginaActivos === totalPaginasActivos}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de archivados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700">Inmuebles Archivados</h2>
          </div>
          <div className="p-6">
            {archivados.length === 0 ? (
              <p className="text-center text-gray-500">No hay inmuebles archivados.</p>
            ) : (
              <div className="grid gap-4">
                {archivadosPagina.map((i) => (
                  <div
                    key={i.id_inmueble}
                    className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all relative border-l-4 border-l-red-400"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {i.estado?.nombre && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          {i.estado.nombre}
                        </span>
                      )}
                      {i.operacion?.nombre && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {i.operacion.nombre}
                        </span>
                      )}
                    </div>

                    <InmuebleCard inmueble={i} />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => toggleArchivar(i.id_inmueble, i.archivadoLocal)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                      >
                        Activar
                      </button>
                      <button
                        onClick={() => handleModificar(i.id_inmueble)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        Modificar
                      </button>
                      {/* ✅ Botón eliminar solo para archivados */}
                      <button
                        onClick={() => handleEliminar(i.id_inmueble)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación Archivados */}
            {totalPaginasArchivados > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setPaginaArchivados((p) => Math.max(p - 1, 1))}
                  disabled={paginaArchivados === 1}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                {[...Array(totalPaginasArchivados)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPaginaArchivados(index + 1)}
                    className={`px-3 py-2 rounded-lg ${
                      paginaArchivados === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPaginaArchivados((p) => Math.min(p + 1, totalPaginasArchivados))
                  }
                  disabled={paginaArchivados === totalPaginasArchivados}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#63bae9] text-white py-6 text-center mt-auto">
        <p className="text-sm">
          © 2025 Inmovación - GBS y Asociados. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}