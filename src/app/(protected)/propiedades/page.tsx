/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/propiedades/page.tsx

'use client';

/**
 * Página principal de gestión de propiedades.
 * Contiene:
 * - Listado de inmuebles (activos y archivados)
 * - Paginación
 * - Filtros
 * - CRUD básico (crear, modificar, archivar y eliminar)
 * - Control de sesión (NextAuth)
 */

import { useEffect, useState, useMemo } from 'react';
import { Home, PlusCircle, AlertCircle, User, Calendar, FileSignature } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


import Header from '@/components/ui/Header';
import InmuebleCard from '@/components/InmuebleCard';
import Filtros from '@/components/Filtros';

import toast, { Toaster } from 'react-hot-toast';

import type { InmuebleDTO } from '@/types/inmuebles';
import type { FiltrosInmueble } from '@/types/filtros';
import Loading from '@/components/ui/Loading';
import Modal from "@/components/ui/Modal";


// Tipado local que agrega la propiedad usada solo en UI.
interface InmuebleLocal extends InmuebleDTO {
  archivadoLocal: boolean;
}

export default function PropiedadesPage() {

  // -----------------------------
  // SESIÓN
  // -----------------------------
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoadingAuth = status === 'loading';

  // -----------------------------
  // ESTADOS PRINCIPALES
  // -----------------------------
  const [inmuebles, setInmuebles] = useState<InmuebleLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Paginación separada para activos y archivados
  const [paginaActivos, setPaginaActivos] = useState(1);
  const [paginaArchivados, setPaginaArchivados] = useState(1);

  const [filtros, setFiltros] = useState<FiltrosInmueble>({});

  const inmueblesPorPagina = 5;
  const router = useRouter();


  // =====================================================================
  // ============================ FETCH INMUEBLES ==========================
  // =====================================================================

  const fetchInmuebles = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/inmuebles'); //Aquí el frontend hace un GET al endpoint /api/inmuebles
      if (!res.ok) {
        const errorText = await res.text();

        // Detecta respuesta HTML que indica redirección o login
        if (
          errorText.includes('<!DOCTYPE') ||
          errorText.includes('login') ||
          res.status === 401 ||
          res.status === 302
        ) {
          toast.error('Sesión requerida. Redirigiendo al login...');
          router.push('/login');
          return;
        }

        throw new Error(`Error ${res.status}: No se pudieron cargar los inmuebles`);
      }

      const data: InmuebleDTO[] = await res.json();

     setInmuebles(
      data.map((i) => {
        const esDisponible =
          i.estado?.nombre?.toLowerCase() === 'disponible';

        return {
          ...i,
          // 🔑 ÚNICA REGLA
          archivadoLocal: !esDisponible,
        };
      })
    );

    } catch (err) {
      console.error('❌ Error en fetchInmuebles:', err);
      setError('No se pudieron cargar los inmuebles');
    } finally {
      setLoading(false);
    }
  };

  // Ejecuta el fetch cuando la sesión está lista
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (status === 'loading' || initialized) return;
    fetchInmuebles();
    setInitialized(true);
  }, [status, initialized]);



  // =====================================================================
  // ============================ HANDLERS ================================
  // =====================================================================

  // Crear nuevo inmueble
  const handleCrear = () => router.push('/propiedades/nuevo');

  // Modificar inmueble
  const handleModificar = (id: number) => router.push(`/propiedades/modificar/${id}`);

  // Archivar / Desarchivar
  const toggleArchivar = async (id: number, archivado: boolean) => {
    try {
      const res = await fetch(`/api/inmuebles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivado: !archivado }),
      });

      if (!res.ok) { //Si la respuesta falla (res.ok === false), se maneja el error, Si es correcta, se parsea JSON y se guarda en el estado inmuebles.
        const errorText = await res.text();

        if (
          errorText.includes('<!DOCTYPE') ||
          errorText.includes('login') ||
          res.status === 401
        ) {
          toast.error('Sesión requerida. Redirigiendo...');
          router.push('/login');
          return;
        }
        throw new Error();
      }

      // Actualiza en frontend inmediato
      setInmuebles((prev) =>
        prev.map((i) =>
          i.id_inmueble === id ? { ...i, archivadoLocal: !archivado } : i
        )
      );

      toast.success(
        archivado
          ? 'Propiedad reactivada correctamente'
          : 'Propiedad archivada correctamente'
      );

    } catch {
      toast.error('Error al actualizar el inmueble');
    }
  };

  // Eliminar inmueble (con Modal)
  const handleEliminar = (id: number) => {
    setModalConfig({
      title: "Eliminar propiedad",
      message:
        "¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/inmuebles/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const errorText = await res.text();

            if (
              errorText.includes("<!DOCTYPE") ||
              errorText.includes("login") ||
              res.status === 401
            ) {
              toast.error("Sesión requerida. Redirigiendo...");
              router.push("/login");
              return;
            }

            throw new Error("Error al eliminar la propiedad");
          }

          // Actualiza UI
          setInmuebles((prev) =>
            prev.filter((i) => i.id_inmueble !== id)
          );

          setModalConfig({
            title: "Propiedad eliminada",
            message: "La propiedad se eliminó correctamente.",
            variant: "success",
            onConfirm: () => setModalOpen(false),
          });
          setModalOpen(true);

        } catch (error: any) {
          setModalConfig({
            title: "Error",
            message: error.message || "Error al eliminar la propiedad",
            variant: "error",
          });
          setModalOpen(true);
        }
      },
    });

    setModalOpen(true);
  };


  // -----------------------------
  // MODAL
  // -----------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info" | "danger";
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
  });


  // =====================================================================
  // ============================ FILTRADO ================================
  // =====================================================================

  const inmueblesFiltrados = useMemo(() => {
    return inmuebles.filter((i) => {
      if (filtros.operacionId && i.id_operacion !== filtros.operacionId) return false;
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
  }, [inmuebles, filtros]);


  const activos = useMemo(
    () => inmueblesFiltrados.filter((i) => !i.archivadoLocal),
    [inmueblesFiltrados]
  );

  const archivados = useMemo(
    () => inmueblesFiltrados.filter((i) => i.archivadoLocal),
    [inmueblesFiltrados]
  );



  // =====================================================================
  // ============================ PAGINACIÓN ==============================
  // =====================================================================

  const paginar = useMemo(
    () => (arr: InmuebleLocal[], page: number) => {
      const inicio = (page - 1) * inmueblesPorPagina;
      return arr.slice(inicio, inicio + inmueblesPorPagina);
    },
    [inmueblesPorPagina]
  );

  const activosPagina = useMemo(
    () => paginar(activos, paginaActivos),
    [activos, paginaActivos, paginar]
  );

  const archivadosPagina = useMemo(
    () => paginar(archivados, paginaArchivados),
    [archivados, paginaArchivados, paginar]
  );

  const totalPaginasActivos = useMemo(
    () => Math.ceil(activos.length / inmueblesPorPagina),
    [activos.length, inmueblesPorPagina]
  );

  const totalPaginasArchivados = useMemo(
    () => Math.ceil(archivados.length / inmueblesPorPagina),
    [archivados.length, inmueblesPorPagina]
  );

  const totalCount = useMemo(
    () => (isAuthenticated ? inmuebles.length : activos.length),
    [isAuthenticated, inmuebles.length, activos.length]
  );


  // =====================================================================
  // ============================= RENDER ================================
  // =====================================================================

  // Mientras se valida la sesión
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading
          message="Cargando propiedades..."
          size="lg"
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />
      {/* HEADER */}
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
              {totalCount} {totalCount === 1 ? 'propiedad' : 'propiedades'}
            </span>
          </div>
        </div>
      </header>
      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
        <Alert className="mb-6 bg-[#fef9e7] border-l-4 border-[#fcc238]">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

        {/* BOTÓN CREAR - Solo para usuarios logueados */}
        {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleCrear}
            className="group relative p-6 rounded-xl font-medium flex items-center gap-4 
                      transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                      bg-[#63bae9] overflow-hidden"
          >
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/25 
                            opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Contenido */}
            <div className="relative flex items-center gap-4">
              {/* Cuadrado blanco */}
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center 
                              group-hover:rotate-12 transition-transform duration-300 shadow-md">
                <FileSignature className="w-7 h-7 text-[#63bae9]" strokeWidth={2} />
              </div>

              {/* Texto */}
              <div className="flex-1 text-left text-white">
                <div className="text-lg font-bold mb-1">
                  Registrar Propiedad
                </div>
                <div className="text-sm opacity-90">
                  Agrega un nuevo inmueble
                </div>
              </div>
            </div>
          </button>
        </div>
      )}


        {/* FILTROS */}
        <Filtros
          filtros={filtros}
          setFiltros={setFiltros}
          onApply={() => {
            setPaginaActivos(1);
            setPaginaArchivados(1);
          }}
        />
        {/* LISTADO ACTIVOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-700">
              Inmuebles Activos
            </h2>

            {/* Contador */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#ecfdf5]">
              <div className="w-2 h-2 rounded-full animate-pulse bg-[#22c55e]" />
              <span className="text-sm font-medium text-gray-600">
                {activos.length} {activos.length === 1 ? 'activo' : 'activos'}
              </span>
            </div>
          </div>

          <div className="p-6">
          {loading && activos.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-[#63bae9] rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-semibold text-[#969696]">
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
                    {/* Tags - solo usuarios logueados */}
                    {isAuthenticated && (
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
                    )}

                    <InmuebleCard inmueble={i} />
                    {/* ← Info básica de creación/modificación (solo para logueados) */}
                    {isAuthenticated && (
                      <div className="pt-4 border-t border-gray-100 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Creado por:</span>
                            <span className="font-bold text-gray-700">{i.createdBy?.nombre || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">Creado:</span>
                            <span className="font-bold text-gray-700">
                              {i.createdAt ? new Date(i.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' •') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Actualizado por:</span>
                            <span className="font-bold text-gray-700">{i.updatedBy?.nombre || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">Actualizado:</span>
                            <span className="font-bold text-gray-700">
                              {i.updatedAt ? new Date(i.updatedAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' •') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* ACCIONES - Solo para usuarios logueados */}
                    {isAuthenticated && (
                      <div className="mt-4 flex gap-3">
                        {/* ARCHIVAR → cuando NO está archivado */}
                        <button
                          onClick={() =>
                            toggleArchivar(i.id_inmueble, i.archivadoLocal)
                          }
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
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* PAGINACIÓN ACTIVOS */}
            {totalPaginasActivos > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() =>
                    setPaginaActivos((p) => Math.max(p - 1, 1))
                  }
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
                    setPaginaActivos((p) =>
                      Math.min(p + 1, totalPaginasActivos)
                    )
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
        {/* ARCHIVADOS - Solo para usuarios logueados */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-700">
                Inmuebles Archivados
              </h2>

              {/* Contador */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#fef2f2]">
                <div className="w-2 h-2 rounded-full animate-pulse bg-[#ef4444]" />
                <span className="text-sm font-medium text-gray-600">
                  {archivados.length} {archivados.length === 1 ? 'archivado' : 'archivados'}
                </span>
              </div>
            </div>

            <div className="p-6">
              {archivados.length === 0 ? (
                <p className="text-center text-gray-500">
                  No hay inmuebles archivados.
                </p>
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
                      {/* ← Info básica de creación/modificación (igual para archivados) */}
                      <div className="pt-4 border-t border-gray-100 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Creado por:</span>
                            <span className="font-bold text-gray-700">{i.createdBy?.nombre || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">Creado:</span>
                            <span className="font-bold text-gray-700">
                              {i.createdAt ? new Date(i.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' •') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Actualizado por:</span>
                            <span className="font-bold text-gray-700">{i.updatedBy?.nombre || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">Actualizado:</span>
                            <span className="font-bold text-gray-700">
                              {i.updatedAt ? new Date(i.updatedAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' •') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        {/* ACTIVAR → cuando SÍ está archivado */}
                        <button
                          onClick={() =>
                            toggleArchivar(i.id_inmueble, i.archivadoLocal)
                          }
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
                        <button
                          onClick={() => handleEliminar(i.id_inmueble)}
                          className="px-4 py-2 text-sm rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* PAGINACIÓN ARCHIVADOS */}
              {totalPaginasArchivados > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() =>
                      setPaginaArchivados((p) => Math.max(p - 1, 1))
                    }
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
                      setPaginaArchivados((p) =>
                        Math.min(p + 1, totalPaginasArchivados)
                      )
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
        )}
      </main>

      {/* MODAL GLOBAL */}
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      title={modalConfig.title}
      message={modalConfig.message}
      variant={modalConfig.variant}
      onConfirm={modalConfig.onConfirm}
    />

    </div>
  );
}