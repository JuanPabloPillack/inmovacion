"use client";
import { useState } from "react";

export default function SubirImagenes({ inmuebleId }: { inmuebleId: number }) {
  const [principal, setPrincipal] = useState<File | null>(null);
  const [galeria, setGaleria] = useState<FileList | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const subirArchivo = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { url } = await res.json();
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);

    // 1. Subir y guardar foto principal
    if (principal) {
      const url = await subirArchivo(principal);
      await fetch(`/api/inmuebles/${inmuebleId}/foto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }

    // 2. Subir y guardar fotos adicionales
    if (galeria) {
      for (const file of Array.from(galeria)) {
        const url = await subirArchivo(file);
        await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inmuebleId, url }),
        });
      }
    }

    setSubiendo(false);
    alert("Imágenes guardadas correctamente 🚀");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Foto principal:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPrincipal(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <label className="block">Galería de fotos:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setGaleria(e.target.files)}
        />
      </div>

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
