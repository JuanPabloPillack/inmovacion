// src/app/(protected)/contratos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { FileText, PlusCircle, AlertCircle, Download, Trash2, Calendar, DollarSign, User, Home, Search, ArrowLeft, Filter, X, Edit3, Eye } from 'lucide-react';
import Combobox from '@/components/ui/combobox';

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

interface Cliente { id_cliente: number; nombre: string; }
interface Inmueble { id_inmueble: number; titulo: string; }
interface Template { id: number; nombre: string; }

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
  const [fechaHasta, setFechaHasta] = useState('');
  const [id_cliente, setIdCliente] = useState<number | undefined>(undefined);
  const [id_inmueble, setIdInmueble] = useState<number | undefined>(undefined);
  const [id_template, setIdTemplate] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchInmuebles();
    fetchTemplates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchContratos();
    }, search ? 400 : 0);

    return () => clearTimeout(timer);
  }, [search, fechaDesde, fechaHasta, id_cliente, id_inmueble, id_template, page]);

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
      const res = await fetch('/api/templates?pageSize=1000');
      if (!res.ok) throw new Error('Error al cargar templates');
      const data = await res.json();
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
      if (fechaHasta) params.append('fechaHasta', fechaHasta);
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
      fetchContratos();
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

  const clearFilters = () => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    setIdCliente(undefined);
    setIdInmueble(undefined);
    setIdTemplate(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || fechaDesde || fechaHasta || id_cliente || id_inmueble || id_template;

  const clienteOptions = clientes.map(c => ({ value: c.id_cliente, label: c.nombre }));
  const inmuebleOptions = inmuebles.map(i => ({ value: i.id_inmueble, label: i.titulo }));
  const templateOptions = templates.map(t => ({ value: t.id, label: t.nombre }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#686363] tracking-tight">
                  Gestión de Contratos
                </h1>
                <p className="text-sm text-[#969696] mt-1">
                  Administra y descarga tus contratos generados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-[#fcc238]/20">
                <div className="w-2 h-2 rounded-full bg-[#fcc238] animate-pulse"></div>
                <span className="text-sm font-semibold text-[#686363]">
                  {total} {total === 1 ? 'contrato' : 'contratos'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <a
            href="/contratos/nuevo"
            className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <PlusCircle className="w-7 h-7" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold mb-1">Crear Nuevo Contrato</div>
                <div className="text-sm text-white/90">Genera un contrato desde una plantilla</div>
              </div>
            </div>
          </a>

          <a
            href="/templates"
            className="group relative overflow-hidden p-6 rounded-2xl bg-white border-2 border-[#fcc238]/30 hover:border-[#fcc238] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <FileText className="w-7 h-7 text-[#fcc238]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-[#686363] mb-1">Gestionar Plantillas</div>
                <div className="text-sm text-[#969696]">Administra tus plantillas de contratos</div>
              </div>
            </div>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#63bae9]/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#63bae9]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#686363]">Búsqueda y Filtros</h3>
                  <p className="text-sm text-[#969696]">Encuentra contratos específicos</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#63bae9] text-white font-medium hover:bg-[#4a9fd4] transition-colors shadow-md hover:shadow-lg"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-bold text-[#686363] mb-2">
                    Buscar por nombre
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Ej: Contrato Alquiler Casa 123"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363] placeholder:text-[#969696]"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#969696]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#686363] mb-2">
                    Fecha Desde
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363]"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#969696] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#686363] mb-2">
                    Fecha Hasta
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363]"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#969696] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Combobox
                    options={clienteOptions}
                    value={id_cliente}
                    onChange={setIdCliente}
                    placeholder="Todos los clientes"
                    label={
                      <>
                        <User className="w-4 h-4 inline mr-1 text-[#63bae9]" />
                        Cliente
                      </>
                    }
                    searchPlaceholder="Buscar cliente..."
                  />
                </div>

                <div>
                  <Combobox
                    options={inmuebleOptions}
                    value={id_inmueble}
                    onChange={setIdInmueble}
                    placeholder="Todos los inmuebles"
                    label={
                      <>
                        <Home className="w-4 h-4 inline mr-1 text-[#63bae9]" />
                        Inmueble
                      </>
                    }
                    searchPlaceholder="Buscar inmueble..."
                  />
                </div>

                <div>
                  <Combobox
                    options={templateOptions}
                    value={id_template}
                    onChange={setIdTemplate}
                    placeholder="Todas las plantillas"
                    label={
                      <>
                        <FileText className="w-4 h-4 inline mr-1 text-[#63bae9]" />
                        Plantilla
                      </>
                    }
                    searchPlaceholder="Buscar Plantilla..."
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#969696] hover:text-[#686363] hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-[#686363]">Contratos Registrados</h2>
            <p className="text-sm text-[#969696] mt-1">
              Lista completa de contratos generados en el sistema
            </p>
          </div>

          <div className="p-6">
            {loading && contratos.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-[#63bae9] rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-semibold text-[#969696]">Cargando contratos...</p>
              </div>
            ) : contratos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#63bae9]/10 to-[#63bae9]/5 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-[#63bae9]" />
                </div>
                <h3 className="text-2xl font-bold text-[#686363] mb-2">
                  No hay contratos disponibles
                </h3>
                <p className="text-lg text-[#969696] mb-8 max-w-md mx-auto">
                  {hasActiveFilters
                    ? 'No se encontraron contratos con los filtros aplicados'
                    : 'Comienza creando tu primer contrato'
                  }
                </p>
                <a
                  href="/contratos/nuevo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#63bae9] to-[#4a9fd4] text-white font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Crear Contrato
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {contratos.map((contrato) => (
                  <div
                    key={contrato.id_contrato}
                    className="group border-2 border-gray-100 rounded-2xl p-6 hover:border-[#63bae9]/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30"
                  >
                    <div className="flex flex-col xl:flex-row gap-6">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[#686363] mb-4 group-hover:text-[#63bae9] transition-colors">
                            {contrato.nombre}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                              <User className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#63bae9]" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-1">Cliente</p>
                                <p className="text-sm font-bold text-[#686363] truncate">{contrato.cliente.nombre}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                              <Home className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#63bae9]" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-1">Inmueble</p>
                                <p className="text-sm font-bold text-[#686363] truncate">{contrato.inmueble.titulo}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                              <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#fcc238]" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-1">Periodo</p>
                                <p className="text-sm font-bold text-[#686363]">
                                  {new Date(contrato.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(contrato.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                              <DollarSign className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#fcc238]" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-1">Monto</p>
                                <p className="text-lg font-bold text-[#686363]">
                                  ${parseFloat(contrato.monto.toString()).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 text-[#63bae9] border border-[#63bae9]/20">
                              <FileText className="w-3.5 h-3.5" />
                              {contrato.template.nombre}
                            </span>
                          </div>

                          {Object.keys(contrato.valores).length > 0 && (
                            <details className="group/details">
                              <summary className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#686363] transition-colors">
                                Campos Variables ({Object.keys(contrato.valores).length})
                              </summary>
                              <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.entries(contrato.valores).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 p-2 rounded-lg bg-white/80">
                                      <span className="text-xs font-bold text-[#969696] uppercase tracking-wide">{key}:</span>
                                      <span className="text-xs font-medium text-[#686363]">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </details>
                          )}
                        </div>
                      </div>

                      {/* BOTONES DE ACCIÓN */}
                      <div className="flex xl:flex-col gap-2 justify-end flex-shrink-0">
                        {/* VER PREVIEW */}
                        <a
                          href={`/contratos/preview/${contrato.id_contrato}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          <Eye className="w-5 h-5" />
                          <span>Vista Previa</span>
                        </a>

                        {/* EDITAR */}
                        <a
                          href={`/contratos/editar/${contrato.id_contrato}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#f59e0b] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          <Edit3 className="w-5 h-5" />
                          <span>Editar</span>
                        </a>

                        {/* DESCARGAR */}
                        <a
                          href={contrato.archivoPath}
                          download
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#63bae9] to-[#4a9fd4] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          <Download className="w-5 h-5" />
                          <span>Descargar</span>
                        </a>

                        {/* ELIMINAR */}
                        <button
                          onClick={() => handleDelete(contrato.id_contrato, contrato.nombre)}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#63bae9] to-[#4a9fd4] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Anterior
                  </button>
                  <span className="text-sm font-bold text-[#686363] px-4 py-2 rounded-lg bg-gray-100">
                    Página {page} de {Math.ceil(total / pageSize) || 1}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#63bae9] to-[#4a9fd4] text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Siguiente
                    <ArrowLeft className="w-5 h-5 transform rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL DE ELIMINACIÓN */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#686363]">¿Eliminar contrato?</h3>
              </div>
              <p className="text-[#969696] mb-6">
                ¿Estás seguro de que quieres eliminar el contrato <span className="font-bold text-[#686363]">"{itemToDelete?.nombre}"</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-[#686363] hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Contratos;