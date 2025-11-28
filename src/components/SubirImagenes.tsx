/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; 
// 👉 Indica que este componente corre en el cliente (Next.js)
// Es necesario porque usamos hooks (useState, eventos, fetch desde el navegador)

import { useState } from "react";

// --------------------------------------------
// Componente principal
// --------------------------------------------
export default function SubirImagenes({ inmuebleId }: { inmuebleId: number }) {
  // Estado que guarda los archivos seleccionados por el usuario
  const [files, setFiles] = useState<FileList | null>(null);

  // Estado para mostrar si se está subiendo (loading)
  const [subiendo, setSubiendo] = useState(false);

  // --------------------------------------------
  // Función que sube UNA imagen al endpoint /api/upload
  // --------------------------------------------
  const subirArchivo = async (file: File) => {
    try {
      // Se usa FormData para enviar archivos por multipart/form-data
      const formData = new FormData();
      formData.append("file", file);

      // Hacemos fetch a la API de subida de archivos
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData, // No se pone Content-Type, el navegador lo agrega automáticamente
      });

      // Parseamos la respuesta
      const data = await res.json();

      // Si la respuesta no fue exitosa → error
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      // Retornamos la URL que la API generó
      return data.url as string;
    } catch (err: any) {
      console.error("Error al subir imagen:", err);
      throw err; // Re-lanzamos el error para manejarlo afuera
    }
  };

  // --------------------------------------------
  // Handler del formulario
  // Se ejecuta cuando el usuario hace "submit"
  // --------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita refresh de la página

    if (!files) return; // Si no hay archivos, no hacemos nada

    setSubiendo(true); // Activamos modo "loading"

    try {
      // Recorremos todos los archivos seleccionados
      for (const file of Array.from(files)) {
        // 1) Subimos la imagen y obtenemos la URL final
        const url = await subirArchivo(file);

        // 2) Guardamos esa URL asociada al inmueble en BD
        await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inmuebleId, url }),
        });
      }

      alert("Imágenes guardadas correctamente 🚀");
    } catch (err) {
      alert("Error al subir imágenes. Revisa la consola para más detalles.");
    } finally {
      setSubiendo(false); // Quitamos modo "loading"
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        Seleccionar imágenes:
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
        />
      </label>
      <button
        type="submit"
        disabled={subiendo}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {subiendo ? "Subiendo..." : "Guardar imágenes"}
      </button>
    </form>
  );
}
