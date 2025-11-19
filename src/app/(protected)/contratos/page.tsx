//src/app/(protected)/contratos/page.tsx

'use client';
import { useState, useEffect, useRef } from 'react';
import { FileText, PlusCircle, AlertCircle, Download, Trash2, Calendar, DollarSign, User, Home, Search, ArrowLeft, Filter, X, Edit3, Eye, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import Combobox from '@/components/ui/combobox';
import Header from '@/components/ui/Header';

interface Cliente { id_cliente: number; nombre: string; }
interface Inmueble { id_inmueble: number; titulo: string; }
interface Template { id: number; nombre: string; }
interface UserInfo { id: string; name: string; }

interface Contrato {
  id_contrato: number;
  nombre: string;
  tipo_contrato: 'ALQUILER_LOCACION' | 'COMPRA_VENTA';
  cliente_1: { id_cliente: number; nombre: string };
  cliente_2: { id_cliente: number; nombre: string };
  inmueble: { id_inmueble: number; titulo: string };
  template: { id: number; nombre: string };
  valores: { [key: string]: string };
  fecha_inicio: string;
  fecha_fin: string;
  monto: number;
  archivoPath: string;
  activo: boolean;
  firmado: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: UserInfo;
  updatedBy: UserInfo;
}

function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'desactivar' | 'activar' | 'eliminar' | 'firmar' | 'desfirmar'>('desactivar');
  const [itemToAction, setItemToAction] = useState<{ id: number; nombre: string } | null>(null);
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoContrato, setTipoContrato] = useState<'ALQUILER_LOCACION' | 'COMPRA_VENTA' | ''>('');
  const [id_cliente_1, setIdCliente1] = useState<number | undefined>(undefined);
  const [id_cliente_2, setIdCliente2] = useState<number | undefined>(undefined);
  const [id_inmueble, setIdInmueble] = useState<number | undefined>(undefined);
  const [id_template, setIdTemplate] = useState<number | undefined>(undefined);
  const [firmado, setFirmado] = useState<boolean | undefined>(undefined);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const getClienteLabels = (tipo: 'ALQUILER_LOCACION' | 'COMPRA_VENTA' | '') => {
    if (tipo === 'ALQUILER_LOCACION') {
      return { cliente1: 'Locador', cliente2: 'Locatario' };
    } else if (tipo === 'COMPRA_VENTA') {
      return { cliente1: 'Vendedor', cliente2: 'Comprador' };
    }
    return { cliente1: 'Cliente 1', cliente2: 'Cliente 2' };
  };

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
  }, [search, fechaDesde, fechaHasta, tipoContrato, id_cliente_1, id_cliente_2, id_inmueble, id_template, firmado, activo, page]);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (openMenuId !== null) {
      const menuRef = menuRefs.current[openMenuId];
      if (menuRef && !menuRef.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [openMenuId]);

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
      if (tipoContrato) params.append('tipo_contrato', tipoContrato);
      if (id_cliente_1) params.append('id_cliente_1', id_cliente_1.toString());
      if (id_cliente_2) params.append('id_cliente_2', id_cliente_2.toString());
      if (id_inmueble) params.append('id_inmueble', id_inmueble.toString());
      if (id_template) params.append('id_template', id_template.toString());
      if (firmado !== undefined) params.append('firmado', firmado.toString());
      if (activo !== undefined) params.append('activo', activo.toString());
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

  const handleAction = (id: number, nombre: string, action: 'desactivar' | 'activar' | 'eliminar' | 'firmar' | 'desfirmar') => {
    setItemToAction({ id, nombre });
    setModalAction(action);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmAction = async () => {
    if (!itemToAction) return;
    try {
      if (modalAction === 'desactivar' || modalAction === 'activar' || modalAction === 'firmar' || modalAction === 'desfirmar') {
        const res = await fetch(`/api/contracts/${itemToAction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activo: modalAction === 'activar' ? true : modalAction === 'desactivar' ? false : undefined,
            firmado: modalAction === 'firmar' ? true : modalAction === 'desfirmar' ? false : undefined,
          }),
        });
        if (!res.ok) throw new Error(`Error al ${modalAction === 'desactivar' ? 'desactivar' : modalAction === 'activar' ? 'activar' : modalAction === 'firmar' ? 'marcar como firmado' : 'desmarcar como firmado'} el contrato`);
      } else if (modalAction === 'eliminar') {
        const res = await fetch(`/api/contracts/${itemToAction.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Error al eliminar permanentemente el contrato');
      }
      setError(null);
      fetchContratos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setModalOpen(false);
      setItemToAction(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setItemToAction(null);
  };

  const clearFilters = () => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    setTipoContrato('');
    setIdCliente1(undefined);
    setIdCliente2(undefined);
    setIdInmueble(undefined);
    setIdTemplate(undefined);
    setFirmado(undefined);
    setActivo(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || fechaDesde || fechaHasta || tipoContrato || id_cliente_1 || id_cliente_2 || id_inmueble || id_template || firmado !== undefined || activo !== undefined;

  const clienteOptions = clientes.map(c => ({ value: c.id_cliente, label: c.nombre }));
  const inmuebleOptions = inmuebles.map(i => ({ value: i.id_inmueble, label: i.titulo }));
  const templateOptions = templates.map(t => ({ value: t.id, label: t.nombre }));

  const { cliente1: labelCliente1, cliente2: labelCliente2 } = getClienteLabels(tipoContrato);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
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
            className="group relative overflow-hidden p-6 deaths rounded-2xl bg-white border-2 border-[#fcc238]/30 hover:border-[#fcc238] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                    Tipo de Contrato
                  </label>
                  <select
                    value={tipoContrato}
                    onChange={(e) => setTipoContrato(e.target.value as 'ALQUILER_LOCACION' | 'COMPRA_VENTA' | '')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363]"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="ALQUILER_LOCACION">Alquiler/Locación</option>
                    <option value="COMPRA_VENTA">Compra/Venta</option>
                  </select>
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
                  <Combobox<number>
                    options={clienteOptions}
                    value={id_cliente_1}
                    onChange={setIdCliente1}
                    placeholder={`Todos los ${labelCliente1.toLowerCase()}s`}
                    label={
                      <>
                        <User className="w-4 h-4 inline mr-1 text-[#63bae9]" />
                        {labelCliente1}
                      </>
                    }
                    searchPlaceholder={`Buscar ${labelCliente1.toLowerCase()}...`}
                  />
                </div>

                <div>
                  <Combobox<number>
                    options={clienteOptions}
                    value={id_cliente_2}
                    onChange={setIdCliente2}
                    placeholder={`Todos los ${labelCliente2.toLowerCase()}s`}
                    label={
                      <>
                        <User className="w-4 h-4 inline mr-1 text-[#63bae9]" />
                        {labelCliente2}
                      </>
                    }
                    searchPlaceholder={`Buscar ${labelCliente2.toLowerCase()}...`}
                  />
                </div>

                <div>
                  <Combobox<number>
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
                  <Combobox<number>
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

                <div>
                  <label className="block text-sm font-bold text-[#686363] mb-2">
                    Estado de Firma
                  </label>
                  <select
                    value={firmado === undefined ? '' : firmado ? 'true' : 'false'}
                    onChange={(e) => setFirmado(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363]"
                  >
                    <option value="">Todos</option>
                    <option value="true">Firmado</option>
                    <option value="false">No Firmado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#686363] mb-2">
                    Estado
                  </label>
                  <select
                    value={activo === undefined ? '' : activo ? 'true' : 'false'}
                    onChange={(e) => setActivo(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#63bae9] focus:outline-none transition-all text-[#686363]"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
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
                {contratos.map((contrato) => {
                  const { cliente1, cliente2 } = getClienteLabels(contrato.tipo_contrato);

                  return (
                    
                    <div
                      key={contrato.id_contrato}
                      className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white relative"
                    >
                      
                      <div className="bg-gradient-to-r from-[#63bae9]/5 via-[#63bae9]/3 to-transparent p-6 border-b border-gray-100">
                      
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#63bae9] to-[#63bae9]/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <FileText className="w-7 h-7 text-white" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-[#686363] mb-2 group-hover:text-[#63bae9] transition-colors">
                                {contrato.nombre}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border-2 border-[#63bae9]/20 text-[#63bae9]">
                                  <FileText className="w-3.5 h-3.5" />
                                  {contrato.tipo_contrato === 'ALQUILER_LOCACION' ? 'Alquiler/Locación' : 'Compra/Venta'}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${contrato.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-[#969696] border-gray-300'}`}>
                                  {contrato.activo ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  {contrato.activo ? 'Activo' : 'Inactivo'}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${contrato.firmado ? 'bg-[#fcc238]/10 text-[#fcc238] border-[#fcc238]/30' : 'bg-gray-100 text-[#969696] border-gray-300'}`}>
                                  {contrato.firmado ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  {contrato.firmado ? 'Firmado' : 'Sin Firmar'}
                                </span>
                              </div>
                            </div>
                          </div>
                         <div ref={(el) => {
  menuRefs.current[contrato.id_contrato] = el;
}}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === contrato.id_contrato ? null : contrato.id_contrato)}
                              className="p-2.5 rounded-lg bg-white border border-gray-200 hover:border-[#63bae9] hover:bg-[#63bae9]/5 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-[#686363]" />
                            </button>
                            {openMenuId === contrato.id_contrato && (
                              <div className="absolute right-6 top-20 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {contrato.activo && (
                                  <>
                                    <a
                                      href={`/contratos/preview/${contrato.id_contrato}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#686363] hover:bg-[#63bae9] hover:text-white transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Vista Previa
                                    </a>
                                    <a
                                      href={`/contratos/editar/${contrato.id_contrato}`}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#686363] hover:bg-[#10b981] hover:text-white transition-colors"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                      Editar
                                    </a>
                                    <a
                                      href={contrato.archivoPath}
                                      download
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#686363] hover:bg-[#63bae9] hover:text-white transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                      Descargar
                                    </a>
                                    <button
                                      onClick={() => handleAction(contrato.id_contrato, contrato.nombre, contrato.firmado ? 'desfirmar' : 'firmar')}
                                      disabled={loading}
                                      className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-[#686363] hover:bg-[#10b981] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {contrato.firmado ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                      {contrato.firmado ? 'Desmarcar Firmado' : 'Marcar Firmado'}
                                    </button>
                                    <button
                                      onClick={() => handleAction(contrato.id_contrato, contrato.nombre, 'desactivar')}
                                      disabled={loading || contrato.firmado}
                                      className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-[#686363] hover:bg-[#fcc238] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Desactivar
                                    </button>
                                  </>
                                )}
                                {!contrato.activo && (
                                  <>
                                    {contrato.firmado && (
                                      <button
                                        onClick={() => handleAction(contrato.id_contrato, contrato.nombre, 'desfirmar')}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-[#686363] hover:bg-[#ef4444] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Desmarcar Firmado
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleAction(contrato.id_contrato, contrato.nombre, 'activar')}
                                      disabled={loading}
                                      className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-[#686363] hover:bg-[#10b981] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Activar
                                    </button>
                                    <button
                                      onClick={() => handleAction(contrato.id_contrato, contrato.nombre, 'eliminar')}
                                      disabled={loading}
                                      className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-[#686363] hover:bg-[#ef4444] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Eliminar Permanentemente
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-[#969696] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Partes del Contrato
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-[#63bae9]/5 to-[#63bae9]/0 border border-[#63bae9]/10">
                              <p className="text-xs font-bold text-[#63bae9] uppercase mb-1">{cliente1}</p>
                              <p className="text-base font-bold text-[#686363]">{contrato.cliente_1.nombre}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-[#63bae9]/5 to-[#63bae9]/0 border border-[#63bae9]/10">
                              <p className="text-xs font-bold text-[#63bae9] uppercase mb-1">{cliente2}</p>
                              <p className="text-base font-bold text-[#686363]">{contrato.cliente_2.nombre}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-[#969696] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Detalles del Contrato
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#63bae9]/10 flex items-center justify-center">
                                  <Home className="w-4 h-4 text-[#63bae9]" />
                                </div>
                                <p className="text-xs font-bold text-[#969696] uppercase">Inmueble</p>
                              </div>
                              <p className="text-sm font-bold text-[#686363]">{contrato.inmueble.titulo}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-[#fcc238]/5 to-[#fcc238]/0 border border-[#fcc238]/20">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#fcc238]/10 flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-[#fcc238]" />
                                </div>
                                <p className="text-xs font-bold text-[#969696] uppercase">Monto</p>
                              </div>
                              <p className="text-lg font-bold text-[#686363]">
                                ${parseFloat(contrato.monto.toString()).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#63bae9]/10 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-[#63bae9]" />
                                </div>
                                <p className="text-xs font-bold text-[#969696] uppercase">Vigencia</p>
                              </div>
                              <p className="text-xs font-bold text-[#686363] leading-relaxed">
                                {new Date(contrato.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                <br />
                                <span className="text-[#969696]">hasta</span> {new Date(contrato.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-xs text-[#969696]">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">Creado por:</span>
                              <span className="font-bold text-[#686363]">{contrato.createdBy.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#969696]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-medium">Creado:</span>
                              <span className="font-bold text-[#686363]">
  {new Date(contrato.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' •')}
</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#969696]">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">Actualizado por:</span>
                              <span className="font-bold text-[#686363]">{contrato.updatedBy.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#969696]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-medium">Actualizado:</span>
                              <span className="font-bold text-[#686363]">
  {new Date(contrato.updatedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' •')}
</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#63bae9]" />
                            <span className="text-xs font-medium text-[#969696]">Plantilla:</span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-[#63bae9]/10 text-[#63bae9] border border-[#63bae9]/20">
                              {contrato.template.nombre}
                            </span>
                          </div>
                        </div>
                        {Object.keys(contrato.valores).length > 0 && (
                          <details className="mt-4 group/details">
                            <summary className="cursor-pointer text-sm font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#686363] border border-gray-200 transition-colors">
                              <FileText className="w-4 h-4 text-[#63bae9]" />
                              Ver Campos Variables ({Object.keys(contrato.valores).length})
                            </summary>
                            <div className="mt-3 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(contrato.valores).map(([key, value]) => (
                                  <div key={key} className="flex items-start gap-2 p-2.5 rounded-md bg-white border border-gray-100">
                                    <span className="text-xs font-bold text-[#63bae9] uppercase tracking-wide shrink-0">{key}:</span>
                                    <span className="text-xs font-medium text-[#686363]">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}

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

        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#686363]">
                  {modalAction === 'desactivar' ? '¿Desactivar contrato?' :
                   modalAction === 'activar' ? '¿Activar contrato?' :
                   modalAction === 'eliminar' ? '¿Eliminar permanentemente?' :
                   modalAction === 'firmar' ? '¿Marcar como firmado?' : '¿Desmarcar como firmado?'}
                </h3>
              </div>
              <p className="text-[#969696] mb-6">
                ¿Estás seguro de que quieres {modalAction === 'desactivar' ? 'desactivar' :
                                         modalAction === 'activar' ? 'activar' :
                                         modalAction === 'eliminar' ? 'eliminar permanentemente' :
                                         modalAction === 'firmar' ? 'marcar como firmado' : 'desmarcar como firmado'}
                el contrato <span className="font-bold text-[#686363]">"{itemToAction?.nombre}"</span>?
                {modalAction === 'eliminar' && ' Esta acción no se puede deshacer.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-[#686363] hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95 ${
                    modalAction === 'activar' || modalAction === 'firmar' ? 'bg-green-500 hover:bg-green-600' :
                    'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {modalAction === 'desactivar' ? 'Desactivar' :
                   modalAction === 'activar' ? 'Activar' :
                   modalAction === 'eliminar' ? 'Eliminar' :
                   modalAction === 'firmar' ? 'Marcar Firmado' : 'Desmarcar Firmado'}
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