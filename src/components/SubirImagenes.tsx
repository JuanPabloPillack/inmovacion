/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";

export default function SubirImagenes({ inmuebleId }: { inmuebleId: number }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const subirArchivo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      return data.url as string;
    } catch (err: any) {
      console.error("Error al subir imagen:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return;

    setSubiendo(true);

    try {
      for (const file of Array.from(files)) {
        const url = await subirArchivo(file);

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
      setSubiendo(false);
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
