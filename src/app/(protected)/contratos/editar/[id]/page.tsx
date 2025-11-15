// src/app/(protected)/contratos/editar/[id]/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Save, AlertCircle, Calendar, DollarSign, Building2, User, FileType, ArrowLeft, Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Combobox from '@/components/ui/combobox';
import { z } from 'zod';

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  tipo_documento?: string;
  descripcion?: string;
  activo?: boolean;
  tipoCliente?: { nombre: string };
}

interface Inmueble {
  id_inmueble: number;
  titulo: string;
  precio?: number;
  superficie_total?: number;
  superficie_cubierta?: number;
  cantidad_ambientes?: number;
  cantidad_banos?: number;
  cantidad_dormitorios?: number;
  cantidad_cocheras?: number;
  cantidad_pisos?: number;
  antiguedad?: number;
  detalles?: string;
  archivado?: boolean;
  ubicacion?: {
    direccion: string;
    ciudad?: string;
    provincia?: string;
    barrio?: { nombre: string; localidad?: { nombre: string } };
  };
  tipo_inmueble?: { nombre: string };
  estado?: { nombre: string };
  operacion?: { nombre: string };
  cliente?: { nombre: string; apellido?: string };
}

interface Template {
  id: number;
  nombre: string;
  camposVariables: string[] | null;
}

interface Contrato {
  id_contrato: number;
  nombre: string;
  id_cliente: number;
  id_inmueble: number;
  id_template: number;
  valores: { [key: string]: string };
  fecha_inicio: string;
  fecha_fin: string;
  monto: string;
  archivoPath: string;
}

// === ESQUEMA ZOD (dentro del archivo) ===
const dateSchema = z.object({
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
}).refine((data) => {
  const start = new Date(data.fecha_inicio);
  const end = new Date(data.fecha_fin);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
}, {
  message: 'La fecha de fin debe ser posterior a la de inicio',
  path: ['fecha_fin'],
});

export default function EditContract() {
  const router = useRouter();
  const { id } = useParams();
  const contratoId = Number(id);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contrato, setContrato] = useState<Contrato | null>(null);

  const [nombre, setNombre] = useState('');
  const [id_cliente, setIdCliente] = useState<number | undefined>(undefined);
  const [id_inmueble, setIdInmueble] = useState<number | undefined>(undefined);
  const [id_template, setIdTemplate] = useState<number | undefined>(undefined);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [fecha_inicio, setFechaInicio] = useState('');
  const [fecha_fin, setFechaFin] = useState('');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null);

  // === ESTADO DE ERRORES DE FECHAS ===
  const [fechaErrors, setFechaErrors] = useState<{ inicio?: string; fin?: string }>({});

  // === VALIDACIÓN EN TIEMPO REAL CON ZOD ===
  useEffect(() => {
    if (!fecha_inicio && !fecha_fin) {
      setFechaErrors({});
      return;
    }

    const result = dateSchema.safeParse({
      fecha_inicio,
      fecha_fin,
    });

    if (!result.success) {
      const errors: { inicio?: string; fin?: string } = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0] === 'fecha_inicio') errors.inicio = issue.message;
        if (issue.path[0] === 'fecha_fin') errors.fin = issue.message;
      });
      setFechaErrors(errors);
    } else {
      setFechaErrors({});
    }
  }, [fecha_inicio, fecha_fin]);

  // === isPrevStepComplete INCLUYE VALIDACIÓN DE FECHAS ===
  const isPrevStepComplete = !!(
    nombre &&
    id_cliente &&
    id_inmueble &&
    fecha_inicio &&
    fecha_fin &&
    monto &&
    !fechaErrors.inicio &&
    !fechaErrors.fin
  );

  // === CARGAR DATOS INICIALES ===
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!contratoId) return;

      try {
        setLoading(true);
        const [clientesRes, inmueblesRes, templatesRes, contratoRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/inmuebles'),
          fetch('/api/templates?pageSize=1000'),
          fetch(`/api/contracts/${contratoId}`),
        ]);

        if (!clientesRes.ok || !inmueblesRes.ok || !templatesRes.ok || !contratoRes.ok) {
          throw new Error('Error al cargar datos');
        }

        const clientesData = await clientesRes.json();
        const inmueblesData = await inmueblesRes.json();
        const templatesData = await templatesRes.json();
        const contratoData = await contratoRes.json();

        setClientes(clientesData);
        setInmuebles(inmueblesData);
        setTemplates(templatesData.templates || []);
        setContrato(contratoData);

        // Precargar valores del contrato
        setNombre(contratoData.nombre || '');
        setIdCliente(contratoData.id_cliente);
        setIdInmueble(contratoData.id_inmueble);
        setIdTemplate(contratoData.id_template);
        setValores(contratoData.valores || {});
        setFechaInicio(contratoData.fecha_inicio.split('T')[0]);
        setFechaFin(contratoData.fecha_fin.split('T')[0]);
        setMonto(contratoData.monto.toString());
      } catch (err) {
        setError('Error al cargar el contrato');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [contratoId]);

  // === CARGAR DETALLES DE CLIENTE E INMUEBLE ===
  useEffect(() => {
    const fetchCliente = async () => {
      if (id_cliente) {
        const res = await fetch(`/api/clientes/${id_cliente}`);
        if (res.ok) setSelectedCliente(await res.json());
      } else {
        setSelectedCliente(null);
      }
    };
    fetchCliente();
  }, [id_cliente]);

  useEffect(() => {
    const fetchInmueble = async () => {
      if (id_inmueble) {
        const res = await fetch(`/api/inmuebles/${id_inmueble}`);
        if (res.ok) setSelectedInmueble(await res.json());
      } else {
        setSelectedInmueble(null);
      }
    };
    fetchInmueble();
  }, [id_inmueble]);

  // === AUTOCOMPLETADO ===
  const autoCompleteField = useCallback((campo: string): string | null => {
    const lowerCampo = campo.toLowerCase();

    if (lowerCampo.includes('cliente_nombre') && selectedCliente?.nombre) return selectedCliente.nombre;
    if (lowerCampo.includes('cliente_apellido') && selectedCliente?.apellido) return selectedCliente.apellido || '';
    if (lowerCampo.includes('cliente_email') && selectedCliente?.email) return selectedCliente.email || '';
    if (lowerCampo.includes('cliente_telefono') && selectedCliente?.telefono) return selectedCliente.telefono || '';
    if (lowerCampo.includes('cliente_tipo_documento') && selectedCliente?.tipo_documento) return selectedCliente.tipo_documento || '';
    if (lowerCampo.includes('cliente_descripcion') && selectedCliente?.descripcion) return selectedCliente.descripcion || '';
    if (lowerCampo.includes('cliente_activo') && selectedCliente?.activo !== undefined) return selectedCliente.activo.toString();
    if (lowerCampo.includes('cliente_tipo') && selectedCliente?.tipoCliente?.nombre) return selectedCliente.tipoCliente.nombre || '';

    if (lowerCampo.includes('inmueble_titulo') && selectedInmueble?.titulo) return selectedInmueble.titulo;
    if (lowerCampo.includes('inmueble_superficie_total') && selectedInmueble?.superficie_total) return selectedInmueble.superficie_total.toString();
    if (lowerCampo.includes('inmueble_superficie_cubierta') && selectedInmueble?.superficie_cubierta) return selectedInmueble.superficie_cubierta.toString();
    if (lowerCampo.includes('inmueble_cantidad_ambientes') && selectedInmueble?.cantidad_ambientes) return selectedInmueble.cantidad_ambientes.toString();
    if (lowerCampo.includes('inmueble_cantidad_banos') && selectedInmueble?.cantidad_banos) return selectedInmueble.cantidad_banos.toString();
    if (lowerCampo.includes('inmueble_cantidad_dormitorios') && selectedInmueble?.cantidad_dormitorios) return selectedInmueble.cantidad_dormitorios.toString();
    if (lowerCampo.includes('inmueble_cantidad_cocheras') && selectedInmueble?.cantidad_cocheras) return selectedInmueble.cantidad_cocheras.toString();
    if (lowerCampo.includes('inmueble_cantidad_pisos') && selectedInmueble?.cantidad_pisos) return selectedInmueble.cantidad_pisos.toString();
    if (lowerCampo.includes('inmueble_antiguedad') && selectedInmueble?.antiguedad) return selectedInmueble.antiguedad.toString();
    if (lowerCampo.includes('inmueble_precio') && selectedInmueble?.precio) return selectedInmueble.precio.toString();
    if (lowerCampo.includes('inmueble_detalles') && selectedInmueble?.detalles) return selectedInmueble.detalles || '';
    if (lowerCampo.includes('inmueble_archivado') && selectedInmueble?.archivado !== undefined) return selectedInmueble.archivado.toString();
    if (lowerCampo.includes('inmueble_direccion') && selectedInmueble?.ubicacion?.direccion) return selectedInmueble.ubicacion.direccion;
    if (lowerCampo.includes('inmueble_ciudad') && selectedInmueble?.ubicacion?.ciudad) return selectedInmueble.ubicacion.ciudad || '';
    if (lowerCampo.includes('inmueble_provincia') && selectedInmueble?.ubicacion?.provincia) return selectedInmueble.ubicacion.provincia || '';
    if (lowerCampo.includes('inmueble_barrio') && selectedInmueble?.ubicacion?.barrio?.nombre) return selectedInmueble.ubicacion.barrio.nombre || '';
    if (lowerCampo.includes('inmueble_localidad') && selectedInmueble?.ubicacion?.barrio?.localidad?.nombre) return selectedInmueble.ubicacion.barrio.localidad.nombre || '';
    if (lowerCampo.includes('inmueble_tipo') && selectedInmueble?.tipo_inmueble?.nombre) return selectedInmueble.tipo_inmueble.nombre || '';
    if (lowerCampo.includes('inmueble_estado') && selectedInmueble?.estado?.nombre) return selectedInmueble.estado.nombre || '';
    if (lowerCampo.includes('inmueble_operacion') && selectedInmueble?.operacion?.nombre) return selectedInmueble.operacion.nombre || '';
    if (lowerCampo.includes('inmueble_propietario') && selectedInmueble?.cliente?.nombre && selectedInmueble?.cliente?.apellido) {
      return `${selectedInmueble.cliente.nombre} ${selectedInmueble.cliente.apellido || ''}`.trim();
    }

    if (lowerCampo.includes('contrato_nombre') && nombre) return nombre;
    if (lowerCampo.includes('contrato_fecha_inicio') && fecha_inicio) return fecha_inicio;
    if (lowerCampo.includes('contrato_fecha_fin') && fecha_fin) return fecha_fin;
    if (lowerCampo.includes('contrato_monto') && monto) return monto;

    return null;
  }, [selectedCliente, selectedInmueble, nombre, fecha_inicio, fecha_fin, monto]);

  // === ACTUALIZAR CAMPOS VARIABLES ===
  useEffect(() => {
    if (!id_template || !isPrevStepComplete) return;

    const selectedTemplate = templates.find(t => t.id === id_template);
    if (!selectedTemplate?.camposVariables) return;

    const newValores = selectedTemplate.camposVariables.reduce((acc, campo) => {
      const autoValue = autoCompleteField(campo);
      return { ...acc, [campo]: autoValue || '' };
    }, {} as { [key: string]: string });

    setValores(newValores);
  }, [
    id_template,
    templates,
    selectedCliente,
    selectedInmueble,
    nombre,
    fecha_inicio,
    fecha_fin,
    monto,
    isPrevStepComplete
  ]);

  // === GUARDAR CAMBIOS CON VALIDACIÓN FINAL ===
  const handleSubmit = async () => {
    if (!nombre || !id_cliente || !id_inmueble || !id_template || !fecha_inicio || !fecha_fin || !monto) {
      setError('Completa todos los campos');
      return;
    }

    // Validación final con Zod
    const result = dateSchema.safeParse({ fecha_inicio, fecha_fin });
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError.message);
      return;
    }

    if (Object.values(valores).some(v => !v)) {
      setError('Completa todos los campos variables');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/contracts/${contratoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          id_cliente,
          id_inmueble,
          id_template,
          valores,
          fecha_inicio,
          fecha_fin,
          monto,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      const data = await res.json();

      window.location.href = data.downloadUrl;
      router.push('/contratos');
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const clienteOptions = clientes.map(c => ({ value: c.id_cliente, label: `${c.nombre} ${c.apellido || ''}`.trim() }));
  const inmuebleOptions = inmuebles.map(i => ({ value: i.id_inmueble, label: i.titulo }));
  const templateOptions = templates.map(t => ({ value: t.id, label: t.nombre }));

  if (loading) return <div className="p-8 text-center">Cargando contrato...</div>;
  if (!contrato) return <div className="p-8 text-center text-red-600">Contrato no encontrado</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />

      <header className="bg-white shadow-sm border-b" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#e8f6fc' }}>
              <FileText className="w-7 h-7" style={{ color: '#63bae9' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#686363' }}>Editar Contrato</h1>
              <p className="text-sm mt-1" style={{ color: '#969696' }}>{contrato.nombre}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {error && (
          <div className="mb-8 p-5 rounded-xl flex items-start gap-4 border-l-4 shadow-sm" style={{ backgroundColor: '#fff9e6', borderLeftColor: '#fcc238' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#fcc238' }} />
            <p className="text-sm" style={{ color: '#969696' }}>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
          <div className="p-8 space-y-8">

            {/* 1. Nombre */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                <FileText className="w-4 h-4" style={{ color: '#63bae9' }} />
                Nombre del Contrato
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border transition-all"
                style={{ borderColor: '#e5e7eb', color: '#686363' }}
              />
            </div>

            {/* 2. Cliente + 3. Inmueble */}
            <div className="grid md:grid-cols-2 gap-6">
              <Combobox
                options={clienteOptions}
                value={id_cliente}
                onChange={setIdCliente}
                placeholder="Selecciona un cliente"
                label={<><User className="w-4 h-4 inline mr-2" style={{ color: '#63bae9' }} />Cliente</>}
                searchPlaceholder="Buscar cliente..."
              />
              <Combobox
                options={inmuebleOptions}
                value={id_inmueble}
                onChange={setIdInmueble}
                placeholder="Selecciona un inmueble"
                label={<><Building2 className="w-4 h-4 inline mr-2" style={{ color: '#63bae9' }} />Inmueble</>}
                searchPlaceholder="Buscar inmueble..."
              />
            </div>

            {/* 4. Fechas y Monto */}
            <div className="pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
              <h3 className="text-lg font-bold mb-5" style={{ color: '#686363' }}>Fechas y Monto</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Fecha Inicio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={fecha_inicio}
                    onChange={e => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: fechaErrors.inicio ? '#ef4444' : '#e5e7eb',
                      backgroundColor: fechaErrors.inicio ? '#fef2f2' : 'white'
                    }}
                  />
                  {fechaErrors.inicio && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{fechaErrors.inicio}</p>
                  )}
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={fecha_fin}
                    onChange={e => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: fechaErrors.fin ? '#ef4444' : '#e5e7eb',
                      backgroundColor: fechaErrors.fin ? '#fef2f2' : 'white'
                    }}
                  />
                  {fechaErrors.fin && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{fechaErrors.fin}</p>
                  )}
                </div>

                {/* Monto */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <DollarSign className="w-4 h-4" style={{ color: '#63bae9' }} />Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
              </div>
            </div>

            {/* 5. TEMPLATE AL FINAL */}
            <div className="pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
              <h3 className="text-lg font-bold mb-5" style={{ color: '#686363' }}>Seleccionar Template</h3>
              <p className="text-sm mb-4" style={{ color: '#969696' }}>Elige el tipo de contrato</p>

              {!isPrevStepComplete && (
                <div className="mt-4 p-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2" style={{ borderColor: '#63bae9', backgroundColor: '#f0f9ff' }}>
                  <Lock className="w-5 h-5" style={{ color: '#63bae9' }} />
                  <p className="text-sm text-center font-medium" style={{ color: '#63bae9' }}>
                    Completa todos los campos anteriores para desbloquear el template
                  </p>
                </div>
              )}

              <Combobox
                options={templateOptions}
                value={id_template}
                onChange={setIdTemplate}
                placeholder="Selecciona un template"
                label={<><FileType className="w-4 h-4 inline mr-2" style={{ color: '#63bae9' }} />Template de Contrato</>}
                searchPlaceholder="Buscar template..."
                disabled={!isPrevStepComplete}
              />
            </div>

            {/* 6. CAMPOS VARIABLES */}
            {isPrevStepComplete && id_template && Object.keys(valores).length > 0 && (
              <div className="pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
                <h3 className="text-lg font-bold mb-5" style={{ color: '#686363' }}>Campos Variables del Template</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(valores).map(campo => (
                    <div key={campo}>
                      <label className="block text-sm font-semibold mb-3" style={{ color: '#686363' }}>{campo}</label>
                      <input
                        type="text"
                        value={valores[campo]}
                        onChange={e => setValores({ ...valores, [campo]: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border transition-all"
                        style={{
                          borderColor: '#e5e7eb',
                          color: '#686363'
                        }}
                        placeholder={`Ingresa ${campo.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="p-8 border-t flex justify-end gap-4" style={{ borderColor: '#f3f4f6', backgroundColor: '#f8f9fa' }}>
            <button
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl font-semibold border transition-all"
              style={{ color: '#686363', borderColor: '#e5e7eb', backgroundColor: 'white' }}
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" /> Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isPrevStepComplete || !id_template}
              className="px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#fcc238' }}
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}