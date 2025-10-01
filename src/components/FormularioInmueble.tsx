/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/ui/Header";

interface Cliente { id_cliente: number; nombre: string; }
interface TipoInmueble { id_tipo_inmueble: number; nombre: string; }
interface Estado { id_estado: number; nombre: string; }
interface Operacion { id_operacion: number; nombre: string; }
interface Barrio { id_barrio: number; nombre: string; }

export default function FormularioInmueble() {
  const formRef = useRef<HTMLFormElement>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [principalIndex, setPrincipalIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(setClientes).catch(console.error);
    fetch("/api/tipos_inmueble").then(r => r.json()).then(setTipos).catch(console.error);
    fetch("/api/estados").then(r => r.json()).then(setEstados).catch(console.error);
    fetch("/api/operaciones").then(r => r.json()).then(setOperaciones).catch(console.error);
    fetch("/api/barrios").then(r => r.json()).then(setBarrios).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (!selectedFiles.length) return;
    setFiles(prev => [...prev, ...selectedFiles]);
    if (principalIndex === null && selectedFiles.length > 0) setPrincipalIndex(0);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (principalIndex === index) setPrincipalIndex(updatedFiles.length > 0 ? 0 : null);
    else if (principalIndex !== null && index < principalIndex) setPrincipalIndex(principalIndex - 1);
  };

  const handleSetPrincipal = (index: number) => setPrincipalIndex(index);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formRef.current) throw new Error("Formulario no encontrado");

      const formData = new FormData(formRef.current);
      const fields = Object.fromEntries(formData.entries());

      // Campos obligatorios
      const direccion = String(fields.direccion || "").trim();
      const id_tipo_inmueble = Number(fields.id_tipo_inmueble);
      const id_cliente = Number(fields.id_cliente);
      const id_estado = Number(fields.id_estado);
      const id_barrio = Number(fields.barrio);
      const superficie_total = Number(fields.superficie_total);

      if (!direccion || isNaN(id_tipo_inmueble) || isNaN(id_cliente) || isNaN(id_estado) || isNaN(id_barrio) || isNaN(superficie_total)) {
        alert("Faltan campos obligatorios");
        setLoading(false);
        return;
      }

      // Crear ubicación
      const resUbicacion = await fetch("/api/ubicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direccion,
          ciudad: fields.ciudad || null,
          provincia: fields.provincia || null,
          id_barrio,
        }),
      });

      if (!resUbicacion.ok) throw new Error("Error al crear la ubicación");
      const ubicacion = await resUbicacion.json();

      // Subida de imágenes
      const uploadedImages: { url: string; principal: boolean }[] = [];
      for (let i = 0; i < files.length; i++) {
        const imageForm = new FormData();
        imageForm.append("file", files[i]);
        const res = await fetch("/api/upload", { method: "POST", body: imageForm });
        if (!res.ok) throw new Error(`Error al subir imagen ${files[i].name}`);
        const data = await res.json();
        uploadedImages.push({ url: data.url, principal: i === principalIndex });
      }

      // Payload final
      const payload = {
        titulo: fields.titulo || "Inmueble",
        tipo_inmueble: { connect: { id_tipo_inmueble } },
        cliente: { connect: { id_cliente } },
        estado: { connect: { id_estado } },
        operacion: fields.id_operacion ? { connect: { id_operacion: Number(fields.id_operacion) } } : undefined,
        ubicacion: { connect: { id_ubicacion: ubicacion.id_ubicacion } },
        superficie_total,
        superficie_cubierta: fields.superficie_cubierta ? Number(fields.superficie_cubierta) : undefined,
        cantidad_ambientes: fields.cantidad_ambientes ? Number(fields.cantidad_ambientes) : undefined,
        antiguedad: fields.antiguedad ? Number(fields.antiguedad) : undefined,
        precio: fields.precio ? Number(fields.precio) : undefined,
        detalles: fields.detalles || undefined,
        imagenes: uploadedImages.length > 0 ? { create: uploadedImages } : undefined,
      };

      const resCreate = await fetch("/api/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resCreate.ok) {
        const errBody = await resCreate.json().catch(() => ({}));
        throw new Error(errBody.error || "Error al guardar el inmueble");
      }

      const inmueble = await resCreate.json();
      alert("✅ Inmueble creado con éxito: " + inmueble.id_inmueble);

      formRef.current.reset();
      setFiles([]);
      setPrincipalIndex(null);

    } catch (error: any) {
      console.error(error);
      alert("❌ Hubo un error: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-[#e5e5e5]"
        >
          <h1 className="text-2xl font-bold text-[#63bae9] text-center">
            Registrar nuevo inmueble
          </h1>

          {/* Título */}
          <div>
            <label className="block">Título</label>
            <input type="text" name="titulo" className="border p-2 w-full" required />
          </div>

          {/* Tipo de propiedad */}
          <div>
            <label className="block">Tipo de propiedad</label>
            <select name="id_tipo_inmueble" className="border p-2 w-full" required defaultValue="">
              <option value="" disabled hidden>Seleccione un tipo</option>
              {tipos.map(t => <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>{t.nombre}</option>)}
            </select>
          </div>

          {/* Operación */}
          <div>
            <label className="block">Operación</label>
            <select name="id_operacion" className="border p-2 w-full" defaultValue="">
              <option value="" disabled hidden>Seleccione una operación</option>
              {operaciones.map(o => <option key={o.id_operacion} value={o.id_operacion}>{o.nombre}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block">Estado</label>
            <select name="id_estado" className="border p-2 w-full" required defaultValue="">
              <option value="" disabled hidden>Seleccione un estado</option>
              {estados.map(e => <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>)}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block">Propietario</label>
            <select name="id_cliente" className="border p-2 w-full" required defaultValue="">
              <option value="" disabled hidden>Seleccione un cliente</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Barrio */}
          <div>
            <label className="block">Barrio</label>
            <select name="barrio" className="border p-2 w-full" required defaultValue="">
              <option value="" disabled hidden>Seleccione un barrio</option>
              {barrios.map(b => <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>)}
            </select>
          </div>

          {/* Dirección, ciudad, provincia, superficies, precio, detalles */}
          <div><label className="block">Dirección</label><input type="text" name="direccion" className="border p-2 w-full" required /></div>
          <div><label className="block">Ciudad</label><input type="text" name="ciudad" className="border p-2 w-full" /></div>
          <div><label className="block">Provincia</label><input type="text" name="provincia" className="border p-2 w-full" /></div>
          <div><label className="block">Superficie total (m²)</label><input type="number" name="superficie_total" className="border p-2 w-full" required /></div>
          <div><label className="block">Superficie cubierta (m²)</label><input type="number" name="superficie_cubierta" className="border p-2 w-full" /></div>
          <div><label className="block">Cantidad de ambientes</label><input type="number" name="cantidad_ambientes" className="border p-2 w-full" /></div>
          <div><label className="block">Antigüedad (años)</label><input type="number" name="antiguedad" className="border p-2 w-full" /></div>
          <div><label className="block">Precio</label><input type="number" name="precio" className="border p-2 w-full" /></div>
          <div><label className="block">Detalles</label><textarea name="detalles" className="border p-2 w-full" /></div>

          {/* Imágenes */}
          <div>
            <label className="block mb-2">Fotos</label>
            <div
              className="border border-gray-400 p-4 flex flex-wrap gap-2 items-center cursor-pointer min-h-[100px]"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <span className="text-3xl font-bold text-gray-500">+</span>
              {files.map((file, i) => (
                <div key={i} className="relative w-20 h-20 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                  {principalIndex === i && <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-1">Principal</span>}
                  <button
                    type="button"
                    onClick={ev => { ev.stopPropagation(); handleRemoveFile(i); }}
                    className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1"
                  >
                    ✕
                  </button>
                  {principalIndex !== i && (
                    <button
                      type="button"
                      onClick={ev => { ev.stopPropagation(); handleSetPrincipal(i); }}
                      className="absolute bottom-0 left-0 bg-green-600 text-white text-xs px-1"
                    >
                      Hacer principal
                    </button>
                  )}
                </div>
              ))}
            </div>
            <input id="fileInput" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Guardando..." : "Guardar Inmueble"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-[#63bae9] text-white py-6 text-center mt-auto">
        <p className="text-sm">
          © 2025 Inmovación - GBS y Asociados. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
