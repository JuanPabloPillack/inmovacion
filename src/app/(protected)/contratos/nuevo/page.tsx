// src/app/(protected)/contratos/nuevo/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { FileText, Save, AlertCircle, Calendar, DollarSign, Building2, User, FileType, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';

interface Cliente { id_cliente: number; nombre: string }
interface Inmueble { id_inmueble: number; titulo: string }
interface Template { id: number; nombre: string; camposVariables: string[] | null }

export default function NewContract() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [nombre, setNombre] = useState('');
  const [id_cliente, setIdCliente] = useState(0);
  const [id_inmueble, setIdInmueble] = useState(0);
  const [id_template, setIdTemplate] = useState(0);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [fecha_inicio, setFechaInicio] = useState('');
  const [fecha_fin, setFechaFin] = useState('');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesRes, inmueblesRes, templatesRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/inmuebles'),
          fetch('/api/templates?pageSize=1000'), // ✅ CORRECCIÓN: Obtener todos los templates
        ]);
        if (!clientesRes.ok || !inmueblesRes.ok || !templatesRes.ok) {
          throw new Error('Error al cargar datos');
        }
        setClientes(await clientesRes.json());
        const inmueblesData = (await inmueblesRes.json()).map((inmueble: any) => ({
          id_inmueble: inmueble.id_inmueble,
          titulo: inmueble.titulo,
        }));
        setInmuebles(inmueblesData);
        
        // ✅ CORRECCIÓN: Extraer el array 'templates' de la respuesta
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
    if (id_template) {
      const selectedTemplate = templates.find(t => t.id === id_template);
      if (selectedTemplate?.camposVariables) {
        const initialValores = selectedTemplate.camposVariables.reduce((acc, campo) => ({
          ...acc,
          [campo]: '',
        }), {});
        setValores(initialValores);
      } else {
        setValores({});
      }
    }
  }, [id_template, templates]);

  const handleSubmit = async () => {
    if (!nombre || !id_cliente || !id_inmueble || !id_template || !fecha_inicio || !fecha_fin || !monto) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    // ✅ Validar que el monto no sea demasiado grande
    const montoNum = parseFloat(monto);
    if (montoNum > 999999999.99) {
      setError('El monto es demasiado grande. Máximo permitido: 999,999,999.99');
      return;
    }
    
    if (Object.values(valores).some(v => !v)) {
      setError('Por favor, completa todos los campos variables');
      return;
    }

    console.log('Valores enviados:', valores);

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
              <h1 className="text-3xl font-bold" style={{ color: '#686363' }}>
                Crear Nuevo Contrato
              </h1>
              <p className="text-sm mt-1" style={{ color: '#969696' }}>
                Completa los datos para generar el contrato
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {error && (
          <div
            className="mb-8 p-5 rounded-xl flex items-start gap-4 border-l-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
            style={{
              backgroundColor: '#fff9e6',
              borderLeftColor: '#fcc238'
            }}
          >
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3cd' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#fcc238' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: '#686363' }}>Atención</p>
              <p className="text-sm mt-1" style={{ color: '#969696' }}>{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
          <div className="p-8 border-b" style={{ borderColor: '#f3f4f6' }}>
            <h2 className="text-xl font-bold" style={{ color: '#686363' }}>
              Información General
            </h2>
            <p className="text-sm mt-1" style={{ color: '#969696' }}>
              Datos básicos del contrato
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                  <FileText className="w-4 h-4" style={{ color: '#63bae9' }} />
                  Nombre del Contrato
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Contrato de Alquiler - Depto 3A"
                  className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    borderColor: '#e5e7eb',
                    color: '#686363'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#63bae9';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                  <User className="w-4 h-4" style={{ color: '#63bae9' }} />
                  Cliente
                </label>
                <div className="relative">
                  <select
                    value={id_cliente}
                    onChange={(e) => setIdCliente(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none"
                    style={{
                      borderColor: '#e5e7eb',
                      color: id_cliente === 0 ? '#969696' : '#686363'
                    }}
                  >
                    <option value={0}>Selecciona un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#969696' }} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#63bae9' }} />
                  Inmueble
                </label>
                <div className="relative">
                  <select
                    value={id_inmueble}
                    onChange={(e) => setIdInmueble(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none"
                    style={{
                      borderColor: '#e5e7eb',
                      color: id_inmueble === 0 ? '#969696' : '#686363'
                    }}
                  >
                    <option value={0}>Selecciona un inmueble</option>
                    {inmuebles.map((inmueble) => (
                      <option key={inmueble.id_inmueble} value={inmueble.id_inmueble}>
                        {inmueble.titulo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#969696' }} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                  <FileType className="w-4 h-4" style={{ color: '#63bae9' }} />
                  Template de Contrato
                </label>
                <div className="relative">
                  <select
                    value={id_template}
                    onChange={(e) => setIdTemplate(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none"
                    style={{
                      borderColor: '#e5e7eb',
                      color: id_template === 0 ? '#969696' : '#686363'
                    }}
                  >
                    <option value={0}>Selecciona un template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#969696' }} />
                </div>
              </div>
            </div>

            {Object.keys(valores).length > 0 && (
              <div className="pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
                <h3 className="text-lg font-bold mb-5" style={{ color: '#686363' }}>
                  Campos Variables del Template
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(valores).map((campo) => (
                    <div key={campo}>
                      <label className="block text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                        {campo}
                      </label>
                      <input
                        type="text"
                        value={valores[campo]}
                        onChange={(e) => setValores({ ...valores, [campo]: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
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

            <div className="pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
              <h3 className="text-lg font-bold mb-5" style={{ color: '#686363' }}>
                Fechas y Monto
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={fecha_inicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#e5e7eb',
                      color: '#686363'
                    }}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={fecha_fin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#e5e7eb',
                      color: '#686363'
                    }}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#686363' }}>
                    <DollarSign className="w-4 h-4" style={{ color: '#63bae9' }} />
                    Monto
                  </label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: '#e5e7eb',
                      color: '#686363'
                    }}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t" style={{ borderColor: '#f3f4f6', backgroundColor: '#f8f9fa' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 border"
                style={{
                  color: '#686363',
                  borderColor: '#e5e7eb',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#fcc238',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#f5b524';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fcc238';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creando Contrato...' : 'Crear Contrato'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}