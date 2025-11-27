// =============================================================
// Componente: ClienteForm
// Usado en crear y editar cliente
// =============================================================

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ClienteForm({
  modo,
  tipoClientes,
  initialData,
  onSubmit,
}: {
  modo: "crear" | "editar";
  tipoClientes: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
}) {
  const [form, setForm] = useState(
    initialData || {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      tipo_documento: "",
      tipoClienteId: "",
      descripcion: "",
    }
  );

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.nombre || form.nombre.trim().length < 2)
      return "El nombre es obligatorio y debe tener al menos 2 caracteres.";

    if (form.apellido && form.apellido.trim().length < 2)
      return "El apellido es demasiado corto.";

    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email))
        return "El email no es válido.";
    }

    if (form.telefono) {
      const telRegex = /^[0-9+\s-]+$/;
      if (!telRegex.test(form.telefono))
        return "El teléfono solo puede contener números, espacios, + y -.";
    }

    if (form.tipo_documento && !form.tipoClienteId)
      return "Si cargás un documento, seleccioná un tipo de cliente.";

    return null;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* NOMBRE + APELLIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[#686363] text-sm">Nombre *</label>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del cliente"
            className="border-[#969696]/40"
          />
        </div>

        <div>
          <label className="text-[#686363] text-sm">Apellido</label>
          <Input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Apellido del cliente"
            className="border-[#969696]/40"
          />
        </div>
      </div>

      {/* EMAIL + TELEFONO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[#686363] text-sm">Email</label>
          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            className="border-[#969696]/40"
          />
        </div>

        <div>
          <label className="text-[#686363] text-sm">Teléfono</label>
          <Input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="351 000 0000"
            className="border-[#969696]/40"
          />
        </div>
      </div>

      {/* DOCUMENTO + TIPO CLIENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[#686363] text-sm">Documento</label>
          <Input
            name="tipo_documento"
            value={form.tipo_documento}
            onChange={handleChange}
            placeholder="DNI / Pasaporte / etc"
            className="border-[#969696]/40"
          />
        </div>

        <div>
          <label className="text-[#686363] text-sm">Tipo de Cliente</label>
          <select
            name="tipoClienteId"
            value={form.tipoClienteId}
            onChange={handleChange}
            className="h-10 w-full border rounded-md border-[#969696]/40 px-3 bg-white text-[#686363]"
          >
            <option value="">Seleccionar tipo…</option>
            {tipoClientes.map((t) => (
              <option key={t.id_tipo_cliente} value={t.id_tipo_cliente}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DESCRIPCION */}
      <div>
        <label className="text-[#686363] text-sm">Descripción</label>
        <Textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Notas del cliente…"
          className="border-[#969696]/40"
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => history.back()}
          className="text-[#686363] border-[#969696]/40"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="bg-[#63bae9] text-white hover:bg-[#63bae9]/90"
        >
          {modo === "crear" ? "Crear Cliente" : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
