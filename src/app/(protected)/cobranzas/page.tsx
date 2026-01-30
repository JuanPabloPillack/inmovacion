// src/app/(protected)/cobranzas/page.tsx

'use client'; 
// Indica que este archivo se ejecuta del lado del cliente (React).
// Es necesario para usar hooks como useState o useEffect.

import { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, AlertCircle, Trash2, FileSignature  } from 'lucide-react';
// Iconos SVG importados como componentes React.

import ConfirmationModal from '@/components/ui/Modal';
// Modal de confirmación para eliminar cobranzas.

import Header from '@/components/ui/Header';
// Componente visual para el encabezado de la página.

import toast, { Toaster } from 'react-hot-toast';
// Biblioteca para notificaciones visuales.

import { useRouter } from "next/navigation";
// Hook de Next.js para navegación del lado del cliente.

import Loading from '@/components/ui/Loading';

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Modal from "@/components/ui/Modal";


// ---------------------------
// TIPOS (interfaces TypeScript)
// ---------------------------

interface UserInfo {
  id: string;
  name: string;
}
// Info del usuario que creó o actualizó una cobranza.

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
}
// Representa un cliente. Se usa en filtros y relaciones.

interface Cobranza {
  id_cobranza: number;
  id_cliente: number;
  id_inmueble?: number | null;
  cliente?: Cliente | null;
  inmueble?: { nombre: string } | null;

  monto: number;
  fecha_cobranza: string;   // Llega como string desde la API
  medio_pago: string;
  concepto: string;
  observaciones?: string | null;
  activa: boolean;

  // NUEVO historial
  createdAt?: string;
  updatedAt?: string;
  createdBy?: UserInfo | null;
  updatedBy?: UserInfo | null;
}


export default function CobranzasPage() {
  const router = useRouter();

  // Estado donde se guardarán las cobranzas obtenidas de la API
  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);

  // Lista de clientes para usar en filtros
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Estado para errores globales
  const [error, setError] = useState<string | null>(null);

  // Loading para indicar carga de datos
  const [loading, setLoading] = useState(false);

  // Control del modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Cobranza | null>(null);

  const handleCrear = () => router.push('/cobranzas/alta');

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

  //clientes
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);



  // ---------------------------
  // PAGINACIÓN + FILTROS
  // ---------------------------

  const [page, setPage] = useState(1);      // Página actual
  const [pageSize] = useState(10);          // Cantidad por página
  const [total, setTotal] = useState(0);    // Total de cobranzas

  // Filtros del usuario
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCliente, setFilterCliente] = useState('');


  // ----------------------------------------
  // Cargar lista de clientes una sola vez
  // ----------------------------------------
  useEffect(() => {
    fetchClientes();
  }, []);


  // ----------------------------------------
  // Cargar cobranzas cuando cambia:
  // página, año, mes, cliente
  // ----------------------------------------
  useEffect(() => {
    fetchCobranzas();
  }, [page, filterYear, filterMonth, filterCliente]);



  // ========================================
  // FUNCIÓN: obtener clientes desde la API
  // ========================================
  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data || []);
    } catch {
      setError('No se pudieron cargar los clientes');
    }
  };


  // ========================================
  // FUNCIÓN: obtener cobranzas (paginadas + filtros)
  // ========================================
  const fetchCobranzas = async () => {
    try {
      setLoading(true);

      // Construimos query params dinámicamente
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (filterYear) query.append("anio", filterYear);
      if (filterMonth) query.append("mes", filterMonth);
      if (filterCliente) query.append("cliente", filterCliente);

      // Llamado a la API
      const res = await fetch(`/api/cobranzas?${query.toString()}`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      // Guardamos datos en estado
      setCobranzas(data.cobranzas);
      setTotal(data.total);
      setError(null);
    } catch {
      setError('No se pudieron cargar las cobranzas');
    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // FUNCIÓN: toggle del campo "activa"
  // ========================================
  const toggleActiva = async (cobranza: Cobranza) => {
    try {
      const res = await fetch(`/api/cobranzas/${cobranza.id_cobranza}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !cobranza.activa }),
      });

      if (!res.ok) throw new Error();

      // Refrescamos el estado sin volver a pegar a la API
      setCobranzas(prev =>
        prev.map(c =>
          c.id_cobranza === cobranza.id_cobranza
            ? { ...c, activa: !c.activa }
            : c
        )
      );

      toast.success("Estado actualizado");
    } catch {
      toast.error("No se pudo cambiar el estado");
    }
  };


  // ========================================
  // FUNCIÓN: abrir modal para eliminar
  // ========================================
  const handleDelete = (cobranza: Cobranza) => {
    setModalConfig({
      title: "Eliminar cobranza",
      message: "¿Estás seguro? Esta acción no se puede deshacer.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/cobranzas/${cobranza.id_cobranza}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error();

          setCobranzas((prev) =>
            prev.filter((c) => c.id_cobranza !== cobranza.id_cobranza)
          );

          setModalConfig({
            title: "Eliminada",
            message: "La cobranza se eliminó correctamente.",
            variant: "success",
            onConfirm: () => setModalOpen(false),
          });

          setModalOpen(true);
        } catch {
          setModalConfig({
            title: "Error",
            message: "No se pudo eliminar la cobranza.",
            variant: "error",
          });
          setModalOpen(true);
        }
      },
    });

    setModalOpen(true);
  };



  // ========================================
  // FUNCIÓN: confirmar eliminación
  // ========================================
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/cobranzas/${itemToDelete.id_cobranza}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      // Recargamos listado después de eliminar
      fetchCobranzas();
      toast.success('Cobranza eliminada correctamente');

    } catch {
      toast.error('Error al eliminar la cobranza');
      fetchCobranzas(); // ← Refresca y muestra loading
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  if (loading && cobranzas.length === 0) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading
        message="Cargando cobranzas..."
        size="lg"
      />
    </div>
  );
}

  const clientesFiltrados = clientes.filter(c => {
    const fullName = `${c.nombre} ${c.apellido}`.toLowerCase();
    return fullName.includes(clienteSearch.toLowerCase());
  });



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />

      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#63bae9]">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Gestión de Cobranzas</h1>
              <p className="text-sm text-gray-500">Administra y controla los pagos registrados</p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-lg bg-[#fef9e7] text-sm font-medium text-gray-600">
            {total} cobranza{total !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

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

        {/* BOTÓN CREAR */}
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
                  Registrar Cobranza
                </div>
                <div className="text-sm opacity-90">
                  Agrega una nueva cobranza
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtrar cobranzas</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select
              className="border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setPage(1); // reset de paginación al filtrar
              }}
            >
              <option value="">Año</option>

              {Array.from(
                { length: new Date().getFullYear() - 2020 + 1 },
                (_, i) => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                }
              )}
            </select>


            <select
              className="border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Mes</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>

            {/* FILTRO CLIENTE QUE SE AUTOCOMPLETA */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cliente (nombre o apellido)"
                className="w-full border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  setShowClienteDropdown(true);
                  setPage(1);
                }}
                onFocus={() => setShowClienteDropdown(true)}
              />

              {showClienteDropdown && clienteSearch && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {clientesFiltrados.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      No hay coincidencias
                    </div>
                  ) : (
                    clientesFiltrados.map(c => (
                      <button
                        key={c.id_cliente}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-[#f0f9ff]"
                        onClick={() => {
                          setFilterCliente(String(c.id_cliente)); // 👈 lo que usa la API
                          setClienteSearch(`${c.apellido}, ${c.nombre}`); // 👈 lo visible
                          setShowClienteDropdown(false);
                        }}
                      >
                        {c.apellido}, {c.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* LISTADO */}
        <div className="bg-white rounded-xl shadow-sm border">

          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-700">Cobranzas Registradas</h2>
          </div>

          <div className="p-6">
            {cobranzas.length === 0 ? (
              <p className="text-center py-16">No hay cobranzas</p>
            ) : (
              <div className="grid gap-4">
                {[...cobranzas]
                  .sort((a, b) => Number(b.activa) - Number(a.activa))
                  .map(c => (
                    <div
                      key={c.id_cobranza}
                      className="border rounded-xl p-5 relative hover:shadow-lg transition-all border-l-4 border-l-[#63bae9]"
                    >
                      {/* ESTADO */}
                      <button
                        onClick={() => toggleActiva(c)}
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                          c.activa
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {c.activa ? 'Activa' : 'Inactiva'}
                      </button>

                      {/* INFO PRINCIPAL */}
                      <p className="text-lg font-bold text-gray-800 mb-2">
                        {c.concepto} — ${c.monto.toLocaleString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        Fecha: {new Date(c.fecha_cobranza).toLocaleDateString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        Cliente: {c.cliente?.nombre}
                      </p>

                      <p className="text-sm text-gray-600">
                        Medio de pago: {c.medio_pago}
                      </p>

                      {c.inmueble && (
                        <p className="text-sm text-gray-600">
                          Inmueble: {c.inmueble.nombre}
                        </p>
                      )}

                      {/* 🆕 HISTORIAL */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-sm text-gray-600">
                        {c.createdBy && (
                          <p>
                            Creado por:{' '}
                            <span className="font-medium">{c.createdBy.name}</span>
                          </p>
                        )}

                        {c.updatedBy && (
                          <p>
                            Actualizado por:{' '}
                            <span className="font-medium">{c.updatedBy.name}</span>
                          </p>
                        )}

                        {c.createdAt && (
                          <p>
                            Fecha de creación:{' '}
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        )}

                        {c.updatedAt && (
                          <p>
                            Última actualización:{' '}
                            {new Date(c.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* ACCIONES */}
                      <div className="mt-4 flex items-center justify-end gap-4">
                        <button
                          onClick={() =>
                            router.push(`/cobranzas/modificar/${c.id_cobranza}`)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          ✏️ Modificar
                        </button>

                        <button
                          onClick={() => handleDelete(c)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-30"
          >
            Anterior
          </button>

          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>

      </main>

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
