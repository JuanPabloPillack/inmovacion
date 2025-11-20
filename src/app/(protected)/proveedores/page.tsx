/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/app/(protected)/proveedores/page.tsx
// Descripción: Gestión de Proveedores (solo activos, con eliminar soft + filtros)
// Proyecto: inmovacion (GBS y Asociados)
// ===============================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Building,
  Trash2,
} from "lucide-react";

// Actions
import { getProveedores } from "@/actions/proveedores/getProveedores";
import { softDeleteProveedor } from "@/actions/proveedores/proveedor-actions";

// Components
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function ProveedoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [proveedores, setProveedores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("nombre_razon_social");
  const [loading, setLoading] = useState(true);

  // Modal soft delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState<number | null>(null);

  // =======================
  // RECARGAR PROVEEDORES
  // =======================
  const refreshProveedores = useCallback(async () => {
    try {
      const data = await getProveedores();
      const activos = data.filter((p: any) => p.estado === true);
      setProveedores(activos);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  }, []);

  // =======================
  // VALIDAR SESIÓN
  // =======================
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    refreshProveedores().finally(() => setLoading(false));
  }, [session, status, router, refreshProveedores]);

  // =======================
  // CONFIRMAR ELIMINACIÓN
  // =======================
  const confirmDelete = async () => {
    if (!proveedorId) return;

    try {
      await softDeleteProveedor(proveedorId);
      await refreshProveedores();
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
    } finally {
      setIsModalOpen(false);
      setProveedorId(null);
    }
  };

  // =======================
  // FILTRO AVANZADO
  // =======================
  const filteredProveedores = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return proveedores.filter((p) => {
      switch (filterField) {
        case "nombre_razon_social":
          return p.nombre_razon_social.toLowerCase().includes(term);
        case "cuit_cuil":
          return p.cuit_cuil.toLowerCase().includes(term);
        case "correo_contacto":
          return (p.correo_contacto || "").toLowerCase().includes(term);
        case "telefono_contacto":
          return (p.telefono_contacto || "").toLowerCase().includes(term);
        case "direccion":
          return (p.direccion || "").toLowerCase().includes(term);
        case "tipoServicio":
          return (p.tipoServicio?.nombre || "").toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }, [proveedores, searchTerm, filterField]);

  // =======================
  // LOADING
  // =======================
  if (loading) return <Loading message="Cargando proveedores..." />;

  // =======================
  // TABLA
  // =======================
  const TableView = () => (
    <Card className="shadow-lg border-[#969696]/20">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#63bae9]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[#63bae9]" />
            <CardTitle className="text-xl text-[#686363]">
              Lista de Proveedores
            </CardTitle>
          </div>
          <Badge className="bg-[#969696]/10 text-[#686363] border border-[#969696]/30">
            {filteredProveedores.length} proveedores
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#969696]/20">
              <TableHead className="text-[#686363] font-medium">Proveedor</TableHead>
              <TableHead className="text-[#686363] font-medium">CUIT/CUIL</TableHead>
              <TableHead className="text-[#686363] font-medium">Teléfono</TableHead>
              <TableHead className="text-[#686363] font-medium">Servicio</TableHead>
              <TableHead className="text-right text-[#686363] font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProveedores.map((p) => (
              <TableRow
                key={p.id_proveedor}
                className="hover:bg-[#63bae9]/5 border-[#969696]/10"
              >
                <TableCell>
                  <span className="font-medium text-[#686363]">
                    {p.nombre_razon_social}
                  </span>
                </TableCell>

                <TableCell className="text-[#686363]">{p.cuit_cuil}</TableCell>

                <TableCell className="text-[#686363]">
                  {p.telefono_contacto || "Sin teléfono"}
                </TableCell>

                <TableCell className="text-[#686363]">
                  {p.tipoServicio?.nombre || "Sin tipo"}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-[#63bae9]/10 text-[#686363]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="border-[#969696]/20">

                      {/* VER DETALLES */}
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/proveedores/${p.id_proveedor}`)
                        }
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      {/* EDITAR */}
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/proveedores/editar?id=${p.id_proveedor}`)
                        }
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      {/* ELIMINAR */}
                      <DropdownMenuItem
                        onClick={() => {
                          setProveedorId(p.id_proveedor);
                          setIsModalOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="h-8 w-8 text-[#63bae9]" />
            <h1 className="text-3xl font-bold text-[#686363]">Gestión de Proveedores</h1>
          </div>
          <p className="text-[#969696]">Administra los proveedores del sistema</p>
        </div>

        {/* Buscador + Filtros + Crear */}
        <Card className="mb-6 border-[#969696]/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">

              {/* SELECT DE CAMPO */}
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="h-10 px-3 rounded-md border border-[#969696]/30 bg-background text-sm text-[#686363] focus:border-[#63bae9]"
              >
                <option value="nombre_razon_social">Nombre</option>
                <option value="cuit_cuil">CUIT/CUIL</option>
                <option value="correo_contacto">Correo</option>
                <option value="telefono_contacto">Teléfono</option>
                <option value="direccion">Dirección</option>
                <option value="tipoServicio">Tipo de servicio</option>
              </select>

              {/* INPUT BUSCAR */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#969696] h-4 w-4" />
                <Input
                  placeholder="Buscar proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#969696]/30 focus:border-[#63bae9] text-[#686363]"
                />
              </div>

              {/* BOTÓN NUEVO */}
              <Button
                onClick={() => router.push("/proveedores/crear")}
                className="gap-2 bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
              >
                <Plus className="h-4 w-4" />
                Crear Proveedor
              </Button>
            </div>
          </CardContent>
        </Card>

        <TableView />
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar proveedor?"
        message="Esta acción lo ocultará del sistema, pero no lo borrará de la base de datos."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
