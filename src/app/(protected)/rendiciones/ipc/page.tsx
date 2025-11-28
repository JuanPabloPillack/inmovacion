/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Check, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import Header from '@/components/ui/Header';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

/**
 * Interface que representa un registro de IPC almacenado en BD.
 * "valor" puede venir como número o como string decimal desde la API.
 */
interface IpcData {
  id: number;
  mes: number;
  anio: number;
  valor: number | string | null;
  fuente: string;
  fechaConsulta: string;
}

export default function IpcManagementPage() {
  
  // Estado donde guardamos todos los datos de IPC obtenidos de la API
  const [ipcData, setIpcData] = useState<IpcData[]>([]);

  // Manejo de errores
  const [error, setError] = useState<string | null>(null);

  // Loading general mientras se cargan o procesan datos
  const [loading, setLoading] = useState(false);

  // Filtro por año para la tabla
  const [filterYear, setFilterYear] = useState<number | null>(null);

  /**
   * useEffect que solo se ejecuta una vez al cargar la página.
   * Llama a la función que obtiene los datos de IPC desde "/api/rendiciones/ipc"
   */
  useEffect(() => {
    fetchIpcData();
  }, []);

  /**
   * Función que hace el fetch a la API y actualiza ipcData con los resultados.
   */
  const fetchIpcData = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/rendiciones/ipc');
      if (!res.ok) throw new Error('No se pudieron cargar los datos de IPC');

      // La API responde { datos: [...] }
      const { datos } = await res.json();
      setIpcData(datos || []);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📌 SUBIR ARCHIVO EXCEL Y PROCESARLO AUTOMÁTICAMENTE
  // ============================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Convertimos el archivo a ArrayBuffer para que XLSX pueda leerlo
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data); // Leemos el archivo
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Tomamos la primera hoja
      const rows: any[] = XLSX.utils.sheet_to_json(sheet); // Convertimos filas a JSON

      /**
       * Mapeamos cada fila del Excel a un objeto compatible con nuestra API:
       * mes | año | valor | fuente | fechaConsulta
       */
      const nuevosDatos = rows.map(r => ({
        mes: Number(r.mes),
        anio: Number(r.anio),
        valor: r.valor !== undefined && r.valor !== null ? Number(r.valor) : 0,
        fuente: r.fuente ?? 'Archivo Excel',
        fechaConsulta: r.fecha_publicacion ?? new Date().toISOString(),
      }));

      // Enviamos todos los registros a la API
      const res = await fetch('/api/rendiciones/ipc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevosDatos),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Archivo procesado y guardado: ${result.count} registros`);
        fetchIpcData(); // Volvemos a cargar la tabla
      } else {
        toast.error('Error guardando en BD: ' + result.error);
      }

    } catch (err: any) {
      toast.error('Error al leer archivo Excel');
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📌 ELIMINAR UN REGISTRO DE IPC
  // ============================================================
  const handleDelete = async (id: number) => {

    if (!confirm('¿Estás seguro de eliminar este dato de IPC?')) return;

    try {
      // Enviamos el id por query string para eliminarlo
      const res = await fetch(`/api/rendiciones/ipc?id=${id}`, {
        method: 'DELETE'
      });

      const result = await res.json();

      if (!res.ok || !result.success)
        throw new Error(result.error || 'No se pudo eliminar');

      toast.success('Dato de IPC eliminado');
      fetchIpcData();

    } catch (err: any) {
      toast.error(err.message || 'Error desconocido');
    }
  };

  // ============================================================
  // 📌 Formatear número del IPC con decimales
  // ============================================================
  const formatValor = (valor: number | string | null) => {
    if (valor === null || valor === undefined) return 'N/A';

    // Si viene como string decimal, lo convertimos
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;

    return isNaN(num)
      ? 'N/A'
      : num.toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
  };

  // Años disponibles para el selector de filtro
  const years = Array.from(new Set(ipcData.map(d => d.anio))).sort((a, b) => b - a);

  // Si el usuario selecciona un año, filtramos, si no mostramos todo
  const filteredData = filterYear
    ? ipcData.filter(d => d.anio === filterYear)
    : ipcData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fcc238' }}>
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#686363' }}>Gestión de IPC</h1>
              <p className="text-sm mt-1" style={{ color: '#969696' }}>Sube y administra los datos del IPC anual</p>
            </div>
          </div>
          <a
            href="/rendiciones"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:shadow-md"
            style={{ borderColor: '#63bae9', color: '#63bae9' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver a Rendiciones</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Upload Excel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fcc238' }}>
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: '#686363' }}>Subir archivo Excel anual</h2>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={loading}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />
        </div>

        {/* Filtro por año */}
        <div className="flex gap-3 items-center">
          <label htmlFor="filterYear" className="font-medium text-gray-700">Filtrar por año:</label>
          <select
            id="filterYear"
            value={filterYear || ''}
            onChange={e => setFilterYear(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Todos</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Lista IPC */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#686363' }}>Datos de IPC</h2>
          {filteredData.length === 0 ? (
            <p className="text-gray-500">No hay datos cargados aún.</p>
          ) : (
            <div className="grid gap-4">
              {filteredData.map(d => (
                <div key={d.id} className="group border-2 border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-lg transition-all" style={{ borderLeftWidth: '6px', borderLeftColor: '#63bae9' }}>
                  <div>
                    <h3 className="font-bold text-gray-700">{new Date(0, d.mes - 1).toLocaleString('es-AR', { month: 'long' })} {d.anio}</h3>
                    <p>Valor: {formatValor(d.valor)}</p>
                    <p>Fuente: {d.fuente}</p>
                    <p>Consultado: {new Date(d.fechaConsulta).toLocaleDateString('es-ES')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#fcc238' }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
