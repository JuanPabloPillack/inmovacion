/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { FileText, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import Header from '@/components/ui/Header';
import toast, { Toaster } from 'react-hot-toast';

interface Cliente {
  id_cliente: number;
  nombre: string;
}

interface Recibo {
  id_recibo: number;
  total: number;
  descripcion: string;
}

interface Cobranza {
  id_cobranza: number;
  cliente: Cliente;
  monto: number;
  concepto: string;
  fecha_cobranza: string;
  recibo: Recibo | null;
}

interface Inmueble {
  id_inmueble: number;
  nombre: string;
}

interface Rendicion {
  id_rendicion: number;
  fecha: string;
  monto_total: number;
  inmueble: Inmueble;
  cobranzas: Cobranza[];
}

export default function RendicionesPage() {
  const [rendiciones, setRendiciones] = useState<Rendicion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Rendicion | null>(null);

  useEffect(() => {
    fetchRendiciones();
  }, []);

  const fetchRendiciones = async () => {
    try {
      setLoading(true);
      console.log('🔹 Fetching rendiciones...');
      const res = await fetch('/api/rendiciones');
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const data = await res.json();
      console.log('✅ Rendiciones cargadas:', data);
      setRendiciones(data || []);
      setError(null);
    } catch (err: any) {
      console.error('💥 Error fetchRendiciones:', err);
      setError(err?.message || 'No se pudieron cargar las rendiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (rend: Rendicion) => {
    setItemToDelete(rend);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      console.log(`🔹 Eliminando rendición #${itemToDelete.id_rendicion}...`);
      const res = await fetch(`/api/rendiciones/${itemToDelete.id_rendicion}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const deletedData = await res.json();
      console.log('✅ Rendición eliminada:', deletedData);

      toast.success('Rendición eliminada correctamente');

      // 🔹 Actualizo el estado sin refetch completo
      setRendiciones(prev => prev.filter(r => r.id_rendicion !== itemToDelete.id_rendicion));
      setError(null);
    } catch (err: any) {
      console.error('💥 Error confirmDelete:', err);
      setError(err?.message || 'No se pudo eliminar la rendición');
      toast.error('Error al eliminar la rendición');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" reverseOrder={false} />

      {/* 🔹 Encabezado */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#63bae9]">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Gestión de Rendiciones</h1>
              <p className="text-sm mt-1 text-gray-500">
                Administra las rendiciones y cobranzas asociadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#e8f7fd]">
            <div className="w-2 h-2 rounded-full animate-pulse bg-[#63bae9]"></div>
            <span className="text-sm font-medium text-gray-600">
              {rendiciones.length} {rendiciones.length === 1 ? 'rendición' : 'rendiciones'}
            </span>
          </div>
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 shadow-sm bg-[#fef9e7] border-l-4 border-[#fcc238]">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-500" />
            <p className="font-medium text-gray-600">{error}</p>
          </div>
        )}

        {/* Botón alta - Grid de 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/rendiciones/alta"
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-[#63bae9]"
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Registrar Rendición</div>
              <div className="text-sm opacity-90">Agrega una nueva rendición de cobranzas</div>
            </div>
          </a>

          <a
            href="/rendiciones/ipc"
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-[#63bae9]"
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Subir archivo de IPC</div>
              <div className="text-sm opacity-90">Carga datos de IPC para cálculos de ajustes</div>
            </div>
          </a>

          <div className="p-6 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <PlusCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Próximamente</p>
            </div>
          </div>
        </div>

        {/* 🔹 Listado de rendiciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700">Rendiciones Registradas</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-[#63bae9]" />
                <p className="mt-4 text-lg font-medium text-gray-400">Cargando rendiciones...</p>
              </div>
            ) : rendiciones.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  No hay rendiciones registradas
                </h3>
                <a
                  href="/rendiciones/alta"
                  className="py-3 px-8 rounded-lg font-medium text-white flex items-center gap-2 mx-auto transition-all hover:opacity-90 bg-[#63bae9]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Registrar Rendición
                </a>
              </div>
            ) : (
              <div className="grid gap-4">
                {rendiciones.map(r => (
                  <div
                    key={r.id_rendicion}
                    className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all relative border-l-4 border-l-[#63bae9]"
                  >
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleDelete(r)}
                        className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 bg-[#fcc238]"
                      >
                        <Trash2 className="w-5 h-5" />
                        Eliminar
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-[#e8f7fd]">
                          <FileText className="w-7 h-7 text-[#63bae9]" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold mb-2 text-gray-700">
                            Rendición #{r.id_rendicion}
                          </h3>
                          <p className="text-sm text-gray-500 mb-1">
                            Inmueble: <span className="font-medium text-gray-700">{r.inmueble?.nombre}</span>
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            Fecha: {new Date(r.fecha).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-500 mb-3">
                            Monto total: <span className="font-semibold text-gray-700">
                              ${r.monto_total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                          </p>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              Cobranzas incluidas:
                            </p>
                            {r.cobranzas.map(c => (
                              <div key={c.id_cobranza} className="text-sm text-gray-500 mb-1">
                                • {c.cliente.nombre} — {c.concepto} — $
                                {c.monto.toLocaleString('es-ES')}
                                {c.recibo && (
                                  <a
                                    href={c.recibo.descripcion}
                                    target="_blank"
                                    className="ml-2 text-[#63bae9] hover:underline"
                                  >
                                    [Ver Recibo]
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeModal}
          onConfirm={confirmDelete}
          title="¿Eliminar rendición?"
          message={
            itemToDelete ? `¿Estás seguro de eliminar la rendición #${itemToDelete.id_rendicion}?` : ''
          }
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </main>
    </div>
  );
}
