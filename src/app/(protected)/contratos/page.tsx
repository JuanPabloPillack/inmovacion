// src/app/(protected)/contratos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { FileText, PlusCircle, AlertCircle, Download, Trash2, Calendar, DollarSign, User, Home, Search, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '@/components/ui/confirmation-modal';

interface Contrato {
  id_contrato: number;
  nombre: string;
  cliente: { nombre: string };
  inmueble: { titulo: string };
  template: { nombre: string };
  valores: { [key: string]: string };
  fecha_inicio: string;
  fecha_fin: string;
  monto: number;
  archivoPath: string;
  createdAt: string;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
}

interface Inmueble {
  id_inmueble: number;
  titulo: string;
}

interface Template {
  id: number;
  nombre: string;
}

function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [id_cliente, setIdCliente] = useState<number | undefined>(undefined);
  const [id_inmueble, setIdInmueble] = useState<number | undefined>(undefined);
  const [id_template, setIdTemplate] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClientes();
    fetchInmuebles();
    fetchTemplates();
  }, []);

  useEffect(() => {
    setPage(1); // Resetear página al cambiar búsqueda
    fetchContratos();
  }, [search]);

  useEffect(() => {
    fetchContratos();
  }, [page, id_cliente, id_inmueble, id_template, fechaDesde]);

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      setError('No se pudieron cargar los clientes');
    }
  };

  const fetchInmuebles = async () => {
    try {
      const res = await fetch('/api/inmuebles');
      if (!res.ok) throw new Error('Error al cargar inmuebles');
      const data = await res.json();
      setInmuebles(data);
    } catch (err) {
      setError('No se pudieron cargar los inmuebles');
    }
  };
  const fetchTemplates = async () => {
    try {
      // ✅ CORRECCIÓN: Usar pageSize grande para obtener todos
      const res = await fetch('/api/templates?pageSize=1000');
      if (!res.ok) throw new Error('Error al cargar templates');
      const data = await res.json();
      // ✅ CORRECCIÓN: Extraer el array 'templates' de la respuesta
      setTemplates(data.templates || []);
    } catch (err) {
      setError('No se pudieron cargar los templates');
    }
  };

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (fechaDesde) params.append('fechaDesde', fechaDesde);
      if (id_cliente) params.append('id_cliente', id_cliente.toString());
      if (id_inmueble) params.append('id_inmueble', id_inmueble.toString());
      if (id_template) params.append('id_template', id_template.toString());
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      const url = `/api/contracts?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar contratos');
      const { contratos, total } = await res.json();
      setContratos(contratos);
      setTotal(total);
    } catch (err) {
      setError('No se pudieron cargar los contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1); // Resetear página al aplicar filtros
    fetchContratos();
  };

  const handleDelete = (id: number, nombre: string) => {
    setItemToDelete({ id, nombre });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch('/api/contracts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      });
      if (!res.ok) throw new Error('Error al eliminar el contrato');
      setError(null);
      fetchContratos(); // Refrescar con filtros y página actual
    } catch (err) {
      setError('Error al eliminar el contrato');
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#63bae9' }}>
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#686363' }}>
                  Gestión de Contratos
                </h1>
                <p className="text-sm mt-1" style={{ color: '#969696' }}>
                  Administra y descarga tus contratos generados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#fef9e7' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#fcc238' }}></div>
              <span className="text-sm font-medium" style={{ color: '#686363' }}>
                {total} {total === 1 ? 'contrato' : 'contratos'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 shadow-sm" style={{ backgroundColor: '#fef9e7', borderLeft: '4px solid #fcc238' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#fcc238' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: '#686363' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="/contratos/nuevo"
            className="group p-6 rounded-xl font-medium text-white flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#63bae9' }}
          >
            <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Crear Nuevo Contrato</div>
              <div className="text-sm opacity-90">Genera un contrato desde una plantilla</div>
            </div>
          </a>

          <a
            href="/templates"
            className="group p-6 rounded-xl font-medium border-2 flex items-center gap-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white"
            style={{ borderColor: '#fcc238', color: '#686363' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform" style={{ backgroundColor: '#fef9e7' }}>
              <FileText className="w-6 h-6" style={{ color: '#fcc238' }} />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Gestionar Templates</div>
              <div className="text-sm" style={{ color: '#969696' }}>Administra tus plantillas de contratos</div>
            </div>
          </a>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Buscar por nombre
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej: Contrato Alquiler"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-opacity-100 transition-all pr-10"
                  style={{
                    color: '#686363',
                    borderColor: search ? '#63bae9' : '#e5e7eb',
                  }}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#969696' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Fecha de Inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-opacity-100 transition-all"
                  style={{
                    color: '#686363',
                    borderColor: fechaDesde ? '#63bae9' : '#e5e7eb',
                  }}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#969696' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Cliente
              </label>
              <select
                value={id_cliente || ''}
                onChange={(e) => setIdCliente(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-opacity-100 transition-all"
                style={{
                  color: '#686363',
                  borderColor: id_cliente ? '#63bae9' : '#e5e7eb',
                }}
              >
                <option value="">Todos los clientes</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id_cliente} value={cliente.id_cliente}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Inmueble
              </label>
              <select
                value={id_inmueble || ''}
                onChange={(e) => setIdInmueble(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-opacity-100 transition-all"
                style={{
                  color: '#686363',
                  borderColor: id_inmueble ? '#63bae9' : '#e5e7eb',
                }}
              >
                <option value="">Todos los inmuebles</option>
                {inmuebles.map((inmueble) => (
                  <option key={inmueble.id_inmueble} value={inmueble.id_inmueble}>
                    {inmueble.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Template
              </label>
              <select
                value={id_template || ''}
                onChange={(e) => setIdTemplate(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-opacity-100 transition-all"
                style={{
                  color: '#686363',
                  borderColor: id_template ? '#63bae9' : '#e5e7eb',
                }}
              >
                <option value="">Todos los templates</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#63bae9' }}
              >
                <Search className="w-5 h-5" />
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold" style={{ color: '#686363' }}>
              Contratos Registrados
            </h2>
            <p className="text-sm mt-1" style={{ color: '#969696' }}>
              Lista completa de contratos generados en el sistema
            </p>
          </div>

          <div className="p-6">
            {loading && contratos.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#63bae9' }}></div>
                <p className="mt-4 text-lg font-medium" style={{ color: '#969696' }}>Cargando contratos...</p>
              </div>
            ) : contratos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
                  <FileText className="w-12 h-12" style={{ color: '#63bae9' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#686363' }}>
                  No hay contratos disponibles
                </h3>
                <p className="text-lg mb-6" style={{ color: '#969696' }}>
                  Haz un ajuste en la búsqueda o crea un nuevo contrato para comenzar
                </p>
                <a
                  href="/contratos/nuevo"
                  className="py-3 px-8 rounded-lg font-medium text-white flex items-center gap-2 mx-auto transition-all hover:opacity-90"
                  style={{ backgroundColor: '#63bae9' }}
                >
                  <PlusCircle className="w-5 h-5" />
                  Crear Contrato
                </a>
              </div>
            ) : (
              <div>
                <div className="grid gap-4">
                  {contratos.map((contrato) => (
                    <div
                      key={contrato.id_contrato}
                      className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                      style={{
                        borderLeftWidth: '6px',
                        borderLeftColor: '#63bae9'
                      }}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Icon and Main Info */}
                        <div className="flex gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#e8f7fd' }}>
                            <FileText className="w-7 h-7" style={{ color: '#63bae9' }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#686363' }}>
                              {contrato.nombre}
                            </h3>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-start gap-2">
                                <User className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#63bae9' }} />
                                <div>
                                  <p className="text-xs font-medium" style={{ color: '#969696' }}>Cliente</p>
                                  <p className="text-sm font-semibold" style={{ color: '#686363' }}>{contrato.cliente.nombre}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Home className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#63bae9' }} />
                                <div>
                                  <p className="text-xs font-medium" style={{ color: '#969696' }}>Inmueble</p>
                                  <p className="text-sm font-semibold" style={{ color: '#686363' }}>{contrato.inmueble.titulo}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fcc238' }} />
                                <div>
                                  <p className="text-xs font-medium" style={{ color: '#969696' }}>Periodo</p>
                                  <p className="text-sm font-semibold" style={{ color: '#686363' }}>
                                    {new Date(contrato.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(contrato.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fcc238' }} />
                                <div>
                                  <p className="text-xs font-medium" style={{ color: '#969696' }}>Monto</p>
                                  <p className="text-sm font-bold" style={{ color: '#686363' }}>
                                    ${parseFloat(contrato.monto.toString()).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Template Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#f0f9ff', color: '#63bae9' }}>
                                Template: {contrato.template.nombre}
                              </span>
                            </div>

                            {/* Variable Fields */}
                            {Object.keys(contrato.valores).length > 0 && (
                              <details className="mt-3 group/details">
                                <summary className="cursor-pointer text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center gap-2 transition-colors" style={{ color: '#686363', backgroundColor: '#f9fafb' }}>
                                  Campos Variables ({Object.keys(contrato.valores).length})
                                </summary>
                                <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(contrato.valores).map(([key, value]) => (
                                      <div key={key} className="flex gap-2">
                                        <span className="text-xs font-semibold" style={{ color: '#969696' }}>{key}:</span>
                                        <span className="text-xs" style={{ color: '#686363' }}>{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </details>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2 justify-end">
                          <a
                            href={contrato.archivoPath}
                            download
                            className="px-4 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: '#63bae9' }}
                          >
                            <Download className="w-5 h-5" />
                            <span className="hidden sm:inline">Descargar</span>
                          </a>
                          <button
                            onClick={() => handleDelete(contrato.id_contrato, contrato.nombre)}
                            className="px-4 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: '#fcc238' }}
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Paginación */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#63bae9' }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Anterior
                  </button>
                  <span className="text-sm font-medium" style={{ color: '#686363' }}>
                    Página {page} de {Math.ceil(total / pageSize)}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                    className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#63bae9' }}
                  >
                    Siguiente
                    <ArrowLeft className="w-5 h-5 transform rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeModal}
          onConfirm={confirmDelete}
          title="¿Eliminar contrato?"
          message={itemToDelete ? `¿Estás seguro de que quieres eliminar el contrato "${itemToDelete.nombre}"? Esta acción no se puede deshacer.` : ''}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </main>
    </div>
  );
}

export default Contratos;