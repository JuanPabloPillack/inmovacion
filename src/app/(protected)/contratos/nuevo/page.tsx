//src/app/(protected)/contratos/nuevo/page.tsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Save, AlertCircle, Calendar, DollarSign, Building2, User, FileType, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function NewContract() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
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
  const router = useRouter();

  const [fechaErrors, setFechaErrors] = useState<{ inicio?: string; fin?: string }>({});

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesRes, inmueblesRes, templatesRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/inmuebles'),
          fetch('/api/templates?pageSize=1000'),
        ]);
        if (!clientesRes.ok || !inmueblesRes.ok || !templatesRes.ok) {
          throw new Error('Error al cargar datos');
        }
        setClientes(await clientesRes.json());
        setInmuebles(await inmueblesRes.json());
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCliente = async () => {
      if (id_cliente) {
        try {
          const res = await fetch(`/api/clientes/${id_cliente}`);
          if (!res.ok) throw new Error('Error al cargar cliente');
          setSelectedCliente(await res.json());
        } catch (err) {
          setError('Error al cargar cliente');
        }
      } else {
        setSelectedCliente(null);
      }
    };
    fetchCliente();
  }, [id_cliente]);

  useEffect(() => {
    const fetchInmueble = async () => {
      if (id_inmueble) {
        try {
          const res = await fetch(`/api/inmuebles/${id_inmueble}`);
          if (!res.ok) throw new Error('Error al cargar inmueble');
          setSelectedInmueble(await res.json());
        } catch (err) {
          setError('Error al cargar inmueble');
        }
      } else {
        setSelectedInmueble(null);
      }
    };
    fetchInmueble();
  }, [id_inmueble]);

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

  useEffect(() => {
    if (!id_template) {
      setValores({});
      return;
    }

    const selectedTemplate = templates.find(t => t.id === id_template);
    if (!selectedTemplate?.camposVariables) {
      setValores({});
      return;
    }

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
    autoCompleteField
  ]);

  const handleSubmit = async () => {
    if (!nombre || !id_cliente || !id_inmueble || !id_template || !fecha_inicio || !fecha_fin || !monto) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const result = dateSchema.safeParse({ fecha_inicio, fecha_fin });
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError.message);
      return;
    }

    const montoNum = parseFloat(monto);
    if (montoNum > 999999999.99) {
      setError('El monto es demasiado grande. Máximo permitido: 999,999,999.99');
      return;
    }

    if (Object.values(valores).some(v => !v)) {
      setError('Por favor, completa todos los campos variables');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/contracts', {
        method: 'POST',
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
      if (!res.ok) throw new Error('Error al crear contrato');
      const data = await res.json();

      window.location.href = data.downloadUrl;
      router.push('/contratos');
    } catch (err) {
      setError('Error al crear el contrato');
    } finally {
      setLoading(false);
    }
  };

  const clienteOptions = clientes.map(cliente => ({
    value: cliente.id_cliente,
    label: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
  }));

  const inmuebleOptions = inmuebles.map(inmueble => ({
    value: inmueble.id_inmueble,
    label: inmueble.titulo,
  }));

  const templateOptions = templates.map(template => ({
    value: template.id,
    label: template.nombre,
  }));

  const steps = [
    { id: 1, name: 'Información General', completed: !!nombre },
    { id: 2, name: 'Partes', completed: !!(id_cliente && id_inmueble) },
    { id: 3, name: 'Fechas y Monto', completed: !!(fecha_inicio && fecha_fin && monto && !fechaErrors.inicio && !fechaErrors.fin) },
    { id: 4, name: 'Template', completed: !!id_template },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />

      <div className="bg-gradient-to-br from-white to-gray-50" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#63bae9' }}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#686363' }}>
                Crear Nuevo Contrato
              </h1>
              <p className="text-base" style={{ color: '#969696' }}>
                Completa la información necesaria para generar tu contrato de manera profesional
              </p>

              <div className="mt-8 flex items-center gap-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
                      backgroundColor: step.completed ? '#e8f6fc' : 'white',
                      border: '1px solid',
                      borderColor: step.completed ? '#63bae9' : '#e5e7eb'
                    }}>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#63bae9' }} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#969696' }} />
                      )}
                      <span className="text-sm font-medium" style={{ color: step.completed ? '#63bae9' : '#969696' }}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 mx-1" style={{ color: '#969696' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div
            className="mb-6 p-5 rounded-xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
            style={{
              backgroundColor: '#fff9e6',
              border: '2px solid #fcc238'
            }}
          >
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#fcc238' }}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base" style={{ color: '#686363' }}>Atención</p>
              <p className="text-sm mt-1" style={{ color: '#969696' }}>{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
              <div className="p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f6fc' }}>
                    <FileText className="w-5 h-5" style={{ color: '#63bae9' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#686363' }}>
                      Información General
                    </h2>
                    <p className="text-xs" style={{ color: '#969696' }}>
                      Identificación del contrato
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                  Nombre del Contrato
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Contrato de Alquiler - Departamento 3A"
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                  style={{
                    borderColor: nombre ? '#63bae9' : '#e5e7eb',
                    backgroundColor: nombre ? '#f0f9ff' : 'white',
                    color: '#686363'
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
              <div className="p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f6fc' }}>
                    <User className="w-5 h-5" style={{ color: '#63bae9' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#686363' }}>
                      Partes del Contrato
                    </h2>
                    <p className="text-xs" style={{ color: '#969696' }}>
                      Cliente e inmueble involucrados
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <Combobox
                  options={clienteOptions}
                  value={id_cliente}
                  onChange={setIdCliente}
                  placeholder="Selecciona un cliente"
                  label={
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: '#63bae9' }} />
                      Cliente
                    </span>
                  }
                  searchPlaceholder="Buscar cliente..."
                />

                <Combobox
                  options={inmuebleOptions}
                  value={id_inmueble}
                  onChange={setIdInmueble}
                  placeholder="Selecciona un inmueble"
                  label={
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" style={{ color: '#63bae9' }} />
                      Inmueble
                    </span>
                  }
                  searchPlaceholder="Buscar inmueble..."
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
              <div className="p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f6fc' }}>
                    <Calendar className="w-5 h-5" style={{ color: '#63bae9' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#686363' }}>
                      Fechas y Monto
                    </h2>
                    <p className="text-xs" style={{ color: '#969696' }}>
                      Vigencia y valor del contrato
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={fecha_inicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                    style={{
                      borderColor: fechaErrors.inicio ? '#ef4444' : (fecha_inicio ? '#63bae9' : '#e5e7eb'),
                      backgroundColor: fechaErrors.inicio ? '#fef2f2' : (fecha_inicio ? '#f0f9ff' : 'white')
                    }}
                  />
                  {fechaErrors.inicio && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{fechaErrors.inicio}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={fecha_fin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                    style={{
                      borderColor: fechaErrors.fin ? '#ef4444' : (fecha_fin ? '#63bae9' : '#e5e7eb'),
                      backgroundColor: fechaErrors.fin ? '#fef2f2' : (fecha_fin ? '#f0f9ff' : 'white')
                    }}
                  />
                  {fechaErrors.fin && (
                    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{fechaErrors.fin}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    <DollarSign className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Monto del Contrato
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: '#969696' }}>$</span>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                      style={{
                        borderColor: monto ? '#63bae9' : '#e5e7eb',
                        backgroundColor: monto ? '#f0f9ff' : 'white',
                        color: '#686363'
                      }}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
              <div className="p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f6fc' }}>
                    <FileType className="w-5 h-5" style={{ color: '#63bae9' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#686363' }}>
                      Seleccionar Plantilla
                    </h2>
                    <p className="text-xs" style={{ color: '#969696' }}>
                      Tipo de contrato a generar
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!isPrevStepComplete && (
                  <div className="mb-5 p-4 rounded-lg border-2 border-dashed flex items-center gap-3" style={{ borderColor: '#63bae9', backgroundColor: '#f0f9ff' }}>
                    <Lock className="w-5 h-5" style={{ color: '#63bae9' }} />
                    <p className="text-sm font-medium" style={{ color: '#63bae9' }}>
                      Completa los pasos anteriores para desbloquear esta sección
                    </p>
                  </div>
                )}

                <Combobox
                  options={templateOptions}
                  value={id_template}
                  onChange={setIdTemplate}
                  placeholder="Selecciona una plantilla"
                  label={
                    <span className="flex items-center gap-2">
                      <FileType className="w-4 h-4" style={{ color: '#63bae9' }} />
                      Plantilla de Contrato
                    </span>
                  }
                  searchPlaceholder="Buscar plantilla..."
                  disabled={!isPrevStepComplete}
                />
              </div>
            </div>

            {isPrevStepComplete && id_template && Object.keys(valores).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
                <div className="p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fff9e6' }}>
                      <FileType className="w-5 h-5" style={{ color: '#fcc238' }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: '#686363' }}>
                        Campos Variables
                      </h2>
                      <p className="text-xs" style={{ color: '#969696' }}>
                        Personaliza el contenido del contrato
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-5">
                  {Object.keys(valores).map((campo) => (
                    <div key={campo}>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                        {campo}
                      </label>
                      <input
                        type="text"
                        value={valores[campo]}
                        onChange={(e) => setValores({ ...valores, [campo]: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                        style={{
                          borderColor: valores[campo] ? '#63bae9' : '#e5e7eb',
                          backgroundColor: valores[campo] ? '#f0f9ff' : 'white',
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

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#686363' }}>
                  Resumen
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: nombre ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Nombre</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {nombre || 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: id_cliente ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Cliente</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {id_cliente ? clienteOptions.find(c => c.value === id_cliente)?.label : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: id_inmueble ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Inmueble</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {id_inmueble ? inmuebleOptions.find(i => i.value === id_inmueble)?.label : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: (fecha_inicio && fecha_fin && !fechaErrors.inicio && !fechaErrors.fin) ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Vigencia</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {(fecha_inicio && fecha_fin) ? `${fecha_inicio} - ${fecha_fin}` : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: monto ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Monto</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {monto ? `$ ${parseFloat(monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: id_template ? '#63bae9' : '#969696' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#686363' }}>Plantilla</p>
                      <p className="text-xs mt-0.5" style={{ color: '#969696' }}>
                        {id_template ? templateOptions.find(t => t.value === id_template)?.label : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#e5e7eb' }}>
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isPrevStepComplete || !id_template}
                    className="w-full px-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#fcc238',
                    }}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Creando...' : 'Crear Contrato'}
                  </button>

                  <button
                    onClick={() => router.back()}
                    className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2"
                    style={{
                      color: '#686363',
                      borderColor: '#e5e7eb',
                      backgroundColor: 'white'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
