/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; 
// 🔹 Indica que este componente se renderiza del lado del cliente (Client Component)
// Necesario porque usa hooks como useState y useEffect.

import { useState, useEffect } from 'react';
import { FileText, PlusCircle, Trash2, Pencil } from 'lucide-react';
// 🔹 Iconos SVG usados en los botones y elementos visuales.

import ConfirmationModal from '@/components/ui/confirmation-modal';
import Header from '@/components/ui/Header';
import toast, { Toaster } from 'react-hot-toast';
// 🔹 toast = para mostrar notificaciones tipo “¡Éxito!” o “Error”.

import { useRouter } from "next/navigation";
// 🔹 Permite navegar programáticamente (router.push).

// ----------------------
// 📌 Interfaces de tipos
// ----------------------

// Cliente con datos básicos
interface Cliente {
  id_cliente: number;
  nombre: string;
}

// Recibo asociado a una cobranza
interface Recibo {
  id_recibo: number;
  total: number;
  descripcion: string;
}

// Cobranza perteneciente a una rendición
interface Cobranza {
  id_cobranza: number;
  cliente: Cliente;   // Objeto cliente relacionado
  monto: number;
  concepto: string;
  fecha_cobranza: string;
  recibo: Recibo | null; // Puede no existir
}

// Inmueble asociado a la rendición
interface Inmueble {
  id_inmueble: number;
  nombre: string;
}

// Rendición completa
interface Rendicion {
  id_rendicion: number;
  fecha: string;
  monto_total: number;
  inmueble: Inmueble;
  cobranzas: Cobranza[];
}

// ---------------------------
// 📌 Componente principal
// ---------------------------

export default function RendicionesPage() {

  const router = useRouter();

  // Estado principal: lista de rendiciones obtenidas del backend
  const [rendiciones, setRendiciones] = useState<Rendicion[]>([]);

  // Para manejo de errores y loader
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados del modal de confirmación para eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Rendicion | null>(null);

  // useEffect ejecuta la carga inicial al montar el componente
  useEffect(() => {
    fetchRendiciones();
  }, []);

  // -------------------------------------------------------
  // 📌 fetchRendiciones() → Obtiene todas las rendiciones
  // -------------------------------------------------------
  const fetchRendiciones = async () => {
    try {
      setLoading(true); // Activar pantallita de carga si existiera

      const res = await fetch('/api/rendiciones'); // GET del backend

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setRendiciones(data || []); // Guardamos la respuesta en el estado

      setError(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las rendiciones');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // 📌 handleDelete() → Abre modal para confirmar eliminación
  // -------------------------------------------------------
  const handleDelete = (rend: Rendicion) => {
    setItemToDelete(rend);     // Guardamos qué rendición se quiere borrar
    setDeleteModalOpen(true);  // Se abre el modal
  };

  // -------------------------------------------------------
  // 📌 confirmDelete() → Hace DELETE al backend
  // -------------------------------------------------------
  const confirmDelete = async () => {
    if (!itemToDelete) return; // Seguridad

    try {
      const res = await fetch(
        `/api/rendiciones/${itemToDelete.id_rendicion}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success('Rendición eliminada correctamente');

      // Sacamos del estado la rendición eliminada
      setRendiciones(prev =>
        prev.filter(r => r.id_rendicion !== itemToDelete.id_rendicion)
      );

      setError(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar la rendición');
      toast.error('Error al eliminar rendición');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // -------------------------------------------------------
  // 📌 closeModal() → Cierra el modal sin eliminar nada
  // -------------------------------------------------------
  const closeModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />

      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#63bae9]">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Gestión de Rendiciones</h1>
              <p className="text-sm text-gray-500">Administra y controla las rendiciones registradas</p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-lg bg-[#fef9e7] text-sm font-medium text-gray-600">
            {rendiciones.length} registros
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="/rendiciones/alta"
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#63bae9' }}
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Registrar Rendición</div>
              <div className="text-sm opacity-90">Crear una nueva rendición</div>
            </div>
          </a>

          <a
            href="/rendiciones/ipc"
            className="group p-6 rounded-xl font-medium border-2 flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white"
            style={{ borderColor: '#fcc238', color: '#686363' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform" style={{ backgroundColor: '#fef9e7' }}>
              <FileText className="w-6 h-6" style={{ color: '#fcc238' }} />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Cargar IPC</div>
              <div className="text-sm" style={{ color: '#969696' }}>Subir archivo de IPC</div>
            </div>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-700">Rendiciones Registradas</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div className="grid gap-4">

                {rendiciones.map(r => (
                  <div
                    key={r.id_rendicion}
                    className="border rounded-xl p-5 relative hover:shadow-lg transition-all border-l-4 border-l-[#63bae9]"
                  >

                    {/* ACCIONES (Modificar + Eliminar) — IGUAL QUE COBRANZAS */}
                    <div className="absolute top-4 right-4 flex gap-3">

                      {/* MODIFICAR */}
                      <button
                        onClick={() => router.push(`/rendiciones/modificar/${r.id_rendicion}`)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        <Pencil className="w-4 h-4" /> Modificar
                      </button>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => handleDelete(r)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-800 mb-2">
                      Rendición #{r.id_rendicion}
                    </p>

                    <p className="text-sm text-gray-600">
                      Inmueble: {r.inmueble?.nombre}
                    </p>

                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(r.fecha).toLocaleDateString('es-ES')}
                    </p>

                    <p className="text-sm font-semibold text-gray-700 mt-2">
                      Monto total: ${r.monto_total.toLocaleString('es-ES')}
                    </p>

                    <div className="bg-gray-50 p-3 mt-3 rounded-lg border">
                      {r.cobranzas.map(c => (
                        <div key={c.id_cobranza} className="text-sm text-gray-600 mb-1">
                          • {c.cliente.nombre} — {c.concepto} — ${c.monto}
                          
                        </div>
                      ))}
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
          message={itemToDelete ? `¿Eliminar la rendición #${itemToDelete.id_rendicion}?` : ''}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </main>
    </div>
  );
}
