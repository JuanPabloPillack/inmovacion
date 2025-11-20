/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/app/(protected)/proveedores/editar/page.tsx
// Descripción: Editar proveedor existente
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Actions
import { getProveedorById, updateProveedor } from "@/actions/proveedores/proveedor-actions";
import { getTiposServicio } from "@/actions/servicios/getTiposServicios"; // si ya tenés esto

// Components
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";

export default function EditarProveedorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [tipoServicios, setTipoServicios] = useState<any[]>([]);
  const [form, setForm] = useState({
    nombre_razon_social: "",
    cuit_cuil: "",
    correo_contacto: "",
    telefono_contacto: "",
    direccion: "",
    tipoServicioId: "",
    datos_bancarios: "",
    observaciones: "",
  });

  // ===============================
  // Cargar datos iniciales
  // ===============================
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const servicios = await getTiposServicio();
        setTipoServicios(servicios);

        const proveedor = await getProveedorById(id);

        if (!proveedor) {
          router.push("/proveedores");
          return;
        }

        setForm({
          nombre_razon_social: proveedor.nombre_razon_social,
          cuit_cuil: proveedor.cuit_cuil,
          correo_contacto: proveedor.correo_contacto ?? "",
          telefono_contacto: proveedor.telefono_contacto ?? "",
          direccion: proveedor.direccion ?? "",
          tipoServicioId: proveedor.tipoServicioId.toString(),
          datos_bancarios: proveedor.datos_bancarios ?? "",
          observaciones: proveedor.observaciones ?? "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (loading) return <Loading message="Cargando proveedor..." />;

  // ===============================
  // Guardar cambios
  // ===============================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await updateProveedor(id, {
        ...form,
        tipoServicioId: Number(form.tipoServicioId),
      });

      router.push("/proveedores");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-[#969696]/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#686363] text-2xl">Editar Proveedor</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Nombre */}
              <div>
                <Label>Nombre / Razón Social</Label>
                <Input
                  value={form.nombre_razon_social}
                  onChange={(e) =>
                    setForm({ ...form, nombre_razon_social: e.target.value })
                  }
                  required
                />
              </div>

              {/* CUIT */}
              <div>
                <Label>CUIT / CUIL</Label>
                <Input
                  value={form.cuit_cuil}
                  onChange={(e) =>
                    setForm({ ...form, cuit_cuil: e.target.value })
                  }
                  required
                />
              </div>

              {/* Correo */}
              <div>
                <Label>Correo de contacto</Label>
                <Input
                  value={form.correo_contacto}
                  onChange={(e) =>
                    setForm({ ...form, correo_contacto: e.target.value })
                  }
                />
              </div>

              {/* Teléfono */}
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono_contacto}
                  onChange={(e) =>
                    setForm({ ...form, telefono_contacto: e.target.value })
                  }
                />
              </div>

              {/* Dirección */}
              <div>
                <Label>Dirección</Label>
                <Input
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                />
              </div>

              {/* Tipo Servicio */}
              <div>
                <Label>Tipo de Servicio</Label>

                <Select
                  value={form.tipoServicioId}
                  onValueChange={(v) =>
                    setForm({ ...form, tipoServicioId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoServicios.map((t) => (
                      <SelectItem key={t.id_tipo_servicio} value={t.id_tipo_servicio.toString()}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Datos bancarios */}
              <div>
                <Label>Datos Bancarios</Label>
                <Textarea
                  value={form.datos_bancarios}
                  onChange={(e) =>
                    setForm({ ...form, datos_bancarios: e.target.value })
                  }
                />
              </div>

              {/* Observaciones */}
              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                />
              </div>

              {/* Acciones */}
              <div className="flex justify-between gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-[#686363]"
                  onClick={() => router.push("/proveedores")}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}