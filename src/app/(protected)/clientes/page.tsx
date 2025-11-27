/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// Archivo: src/app/(protected)/clientes/page.tsx
// Descripción: Gestión de Clientes (solo activos, con soft delete + filtros)
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
  User,
  Trash2,
} from "lucide-react";

// Actions
import { getClientes } from "@/actions/clientes/getClientes";
import { softDeleteCliente } from "@/actions/clientes/cliente-actions";

// Components
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function ClientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("nombre");
  const [loading, setLoading] = useState(true);

  // Modal soft delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteId, setClienteId] = useState<number | null>(null);

  // =======================
  // RECARGAR CLIENTES
  // =======================
  const refreshClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      const activos = data.filter((c: any) => c.activo === true);
      setClientes(activos);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
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

    refreshClientes().finally(() => setLoading(false));
  }, [session, status, router, refreshClientes]);

  // =======================
  // CONFIRMAR ELIMINACIÓN
  // =======================
  const confirmDelete = async () => {
    if (!clienteId) return;

    try {
      await softDeleteCliente(clienteId);
      await refreshClientes();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
    } finally {
      setIsModalOpen(false);
      setClienteId(null);
    }
  };

  // =======================
  // FILTRO AVANZADO
  // =======================
  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return clientes.filter((c) => {
      switch (filterField) {
        case "nombre":
          return c.nombre.toLowerCase().includes(term);
        case "apellido":
          return (c.apellido || "").toLowerCase().includes(term);
        case "email":
          return (c.email || "").toLowerCase().includes(term);
        case "telefono":
          return (c.telefono || "").toLowerCase().includes(term);
        case "tipoCliente":
          return (c.tipoCliente?.nombre || "").toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }, [clientes, searchTerm, filterField]);

  // =======================
  // LOADING
  // =======================
  if (loading) return <Loading message="Cargando clientes..." />;

  // =======================
  // TABLA
  // =======================
  const TableView = () => (
    <Card className="shadow-lg border-[#969696]/20">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#63bae9]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#63bae9]" />
            <CardTitle className="text-xl text-[#686363]">
              Lista de Clientes
            </CardTitle>
          </div>

          <Badge className="bg-[#969696]/10 text-[#686363] border border-[#969696]/30">
            {filteredClientes.length} clientes
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#969696]/20">
              <TableHead className="text-[#686363] font-medium">Nombre</TableHead>
              <TableHead className="text-[#686363] font-medium">Apellido</TableHead>
              <TableHead className="text-[#686363] font-medium">Email</TableHead>
              <TableHead className="text-[#686363] font-medium">Teléfono</TableHead>
              <TableHead className="text-[#686363] font-medium">Tipo</TableHead>
              <TableHead className="text-right text-[#686363] font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredClientes.map((c) => (
              <TableRow
                key={c.id_cliente}
                className="hover:bg-[#63bae9]/5 border-[#969696]/10"
              >
                <TableCell className="text-[#686363]">{c.nombre}</TableCell>
                <TableCell className="text-[#686363]">{c.apellido || "-"}</TableCell>
                <TableCell className="text-[#686363]">{c.email || "Sin email"}</TableCell>
                <TableCell className="text-[#686363]">{c.telefono || "Sin teléfono"}</TableCell>
                <TableCell className="text-[#686363]">
                  {c.tipoCliente?.nombre || "Sin tipo"}
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
                          router.push(`/clientes/${c.id_cliente}`)
                        }
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      {/* EDITAR */}
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/clientes/editar?id=${c.id_cliente}`)
                        }
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      {/* ELIMINAR */}
                      <DropdownMenuItem
                        onClick={() => {
                          setClienteId(c.id_cliente);
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
            <User className="h-8 w-8 text-[#63bae9]" />
            <h1 className="text-3xl font-bold text-[#686363]">Gestión de Clientes</h1>
          </div>
          <p className="text-[#969696]">Administra los clientes del sistema</p>
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
                <option value="nombre">Nombre</option>
                <option value="apellido">Apellido</option>
                <option value="email">Email</option>
                <option value="telefono">Teléfono</option>
                <option value="tipoCliente">Tipo de cliente</option>
              </select>

              {/* INPUT BUSCAR */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#969696] h-4 w-4" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#969696]/30 focus:border-[#63bae9] text-[#686363]"
                />
              </div>

              {/* BOTÓN NUEVO */}
              <Button
                onClick={() => router.push("/clientes/crear")}
                className="gap-2 bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
              >
                <Plus className="h-4 w-4" />
                Crear Cliente
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
        title="¿Eliminar cliente?"
        message="Esta acción lo ocultará del sistema, pero no lo borrará de la base de datos."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
