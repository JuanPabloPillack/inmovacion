'use client';
import { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import Header from '@/components/ui/Header';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  name: string;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
}

interface Cobranza {
  id_cobranza: number;
  id_cliente: number;
  id_inmueble?: number | null;
  cliente?: Cliente | null;
  inmueble?: { nombre: string } | null;
  monto: number;
  fecha_cobranza: string;
  medio_pago: string;
  concepto: string;
  observaciones?: string | null;
  activa: boolean;

  // NUEVO HISTORIAL
  createdAt?: string;
  updatedAt?: string;
  createdBy?: UserInfo | null;
  updatedBy?: UserInfo | null;
}

export default function CobranzasPage() {
  const router = useRouter();
  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Cobranza | null>(null);

  // PAGINACIÓN + FILTROS
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCliente, setFilterCliente] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchCobranzas();
  }, [page, filterYear, filterMonth, filterCliente]);

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      setClientes(data || []);
    } catch {
      setError('No se pudieron cargar los clientes');
    }
  };

  const fetchCobranzas = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (filterYear) query.append("anio", filterYear);
      if (filterMonth) query.append("mes", filterMonth);
      if (filterCliente) query.append("cliente", filterCliente);

      const res = await fetch(`/api/cobranzas?${query.toString()}`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      setCobranzas(data.cobranzas);
      setTotal(data.total);
      setError(null);
    } catch {
      setError('No se pudieron cargar las cobranzas');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiva = async (cobranza: Cobranza) => {
    try {
      const res = await fetch(`/api/cobranzas/${cobranza.id_cobranza}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !cobranza.activa }),
      });

      if (!res.ok) throw new Error();

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

  const handleDelete = (cobranza: Cobranza) => {
    setItemToDelete(cobranza);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/cobranzas/${itemToDelete.id_cobranza}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      fetchCobranzas();
      toast.success('Cobranza eliminada correctamente');
    } catch {
      toast.error('Error al eliminar la cobranza');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

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
            {total} registros
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* BOTÓN CREAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="/cobranzas/alta"
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#63bae9' }}
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Crear Nueva Cobranza</div>
              <div className="text-sm opacity-90">Registrar una nueva cobranza</div>
            </div>
          </a>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtrar cobranzas</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select
              className="border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">📅 Año (opcional)</option>
              {Array.from({ length: 6 }, (_, i) => 2020 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              className="border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">🗓️ Mes (opcional)</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>

            <select
              className="border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-[#63bae9]"
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
            >
              <option value="">👤 Cliente (opcional)</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
              ))}
            </select>

          </div>
        </div>

        {/* LISTADO */}
        <div className="bg-white rounded-xl shadow-sm border">

          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-700">Cobranzas Registradas</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <p>Cargando...</p>
            ) : cobranzas.length === 0 ? (
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
                          c.activa ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
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
                          <p>Creado por: <span className="font-medium">{c.createdBy.name}</span></p>
                        )}

                        {c.updatedBy && (
                          <p>Actualizado por: <span className="font-medium">{c.updatedBy.name}</span></p>
                        )}

                        {c.createdAt && (
                          <p>Fecha de creación: {new Date(c.createdAt).toLocaleString()}</p>
                        )}

                        {c.updatedAt && (
                          <p>Última actualización: {new Date(c.updatedAt).toLocaleString()}</p>
                        )}
                      </div>

                      {/* ACCIONES */}
                      <div className="mt-4 flex items-center justify-end gap-4">
                        <button
                          onClick={() => router.push(`/cobranzas/modificar/${c.id_cobranza}`)}
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cobranza"
        message="¿Estás seguro de que deseas eliminar esta cobranza? Esta acción no se puede deshacer."
      />
    </div>
  );
}
