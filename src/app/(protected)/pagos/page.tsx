// ===============================================
// Archivo: src/app/(protected)/pagos/page.tsx
// Descripción: Gestión de Pagos a Proveedores
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
  FileText,
  Trash2
} from "lucide-react";

// Actions
import { getPagos, deletePago } from "@/actions/pagos/pagos-actions"; 
 
// Components
import Header from "@/components/ui/Header";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function PagosProveedoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pagos, setPagos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("proveedor");
  const [loading, setLoading] = useState(true);

  // Modal eliminar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagoId, setPagoId] = useState<number | null>(null);

  // =======================
  // RECARGAR PAGOS
  // =======================
  const refreshPagos = useCallback(async () => {
    try {
      const data = await getPagos();
      setPagos(data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
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

    refreshPagos().finally(() => setLoading(false));
  }, [session, status, router, refreshPagos]);

  // =======================
  // CONFIRMAR ELIMINACIÓN
  // =======================
  const confirmDelete = async () => {
    if (!pagoId) return;

    try {
      await deletePago(pagoId);
      await refreshPagos();
    } catch (error) {
      console.error("Error eliminando pago:", error);
    } finally {
      setIsModalOpen(false);
      setPagoId(null);
    }
  };

  // =======================
  // FILTRO AVANZADO
  // =======================
  const filteredPagos = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return pagos.filter((p) => {
      switch (filterField) {
        case "proveedor":
          return p.proveedor?.nombre_razon_social.toLowerCase().includes(term);
        case "concepto":
          return p.concepto.toLowerCase().includes(term);
        case "medioPago":
          return p.medioPago?.nombre.toLowerCase().includes(term);
        case "estadoPago":
          return p.estadoPago?.nombre.toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }, [pagos, searchTerm, filterField]);

  // =======================
  // LOADING
  // =======================
  if (loading) return <Loading message="Cargando pagos a proveedores..." />;

  // =======================
  // TABLA
  // =======================
  const TableView = () => (
    <Card className="shadow-lg border-[#969696]/20">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#63bae9]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#63bae9]" />
            <CardTitle className="text-xl text-[#686363]">
              Lista de Pagos
            </CardTitle>
          </div>
          <Badge className="bg-[#969696]/10 text-[#686363] border border-[#969696]/30">
            {filteredPagos.length} pagos
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#969696]/20">
              <TableHead className="text-[#686363] font-medium">Proveedor</TableHead>
              <TableHead className="text-[#686363] font-medium">Concepto</TableHead>
              <TableHead className="text-[#686363] font-medium">Importe</TableHead>
              <TableHead className="text-[#686363] font-medium">Medio</TableHead>
              <TableHead className="text-[#686363] font-medium">Estado</TableHead>
              <TableHead className="text-[#686363] font-medium">Fecha</TableHead>
              <TableHead className="text-right text-[#686363] font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPagos.map((p) => (
              <TableRow
                key={p.id_pago}
                className="hover:bg-[#63bae9]/5 border-[#969696]/10"
              >
                <TableCell className="font-medium text-[#686363]">
                  {p.proveedor?.nombre_razon_social}
                </TableCell>

                <TableCell className="text-[#686363]">{p.concepto}</TableCell>

                <TableCell className="text-[#686363]">
                  ${p.importe}
                </TableCell>

                <TableCell className="text-[#686363]">
                  {p.medioPago?.nombre}
                </TableCell>

                <TableCell className="text-[#686363]">
                  {p.estadoPago?.nombre}
                </TableCell>

                <TableCell className="text-[#686363]">
                  {new Date(p.fecha_pago).toLocaleDateString("es-AR")}
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

                    <DropdownMenuContent
                      align="end"
                      className="border-[#969696]/20"
                    >
                      <DropdownMenuItem
                        onClick={() => router.push(`/pagos/${p.id_pago}`)}
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push(`/pagos/editar?id=${p.id_pago}`)}
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setPagoId(p.id_pago);
                          setIsModalOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-500/10">
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
            <FileText className="h-8 w-8 text-[#63bae9]" />
            <h1 className="text-3xl font-bold text-[#686363]">
              Pagos a Proveedores
            </h1>
          </div>
          <p className="text-[#969696]">Administra todos los pagos realizados</p>
        </div>

        {/* Buscador + Filtros + Crear */}
        <Card className="mb-6 border-[#969696]/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">

              {/* Filtro */}
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="h-10 px-3 rounded-md border border-[#969696]/30 bg-background text-sm text-[#686363] focus:border-[#63bae9]"
              >
                <option value="proveedor">Proveedor</option>
                <option value="concepto">Concepto</option>
                <option value="medioPago">Medio de pago</option>
                <option value="estadoPago">Estado</option>
              </select>

              {/* Buscador */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#969696] h-4 w-4" />
                <Input
                  placeholder="Buscar pago..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#969696]/30 focus:border-[#63bae9] text-[#686363]"
                />
              </div>

              {/* Botón Crear */}
              <Button
                onClick={() => router.push("/pagos/crear")}
                className="gap-2 bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
              >
                <Plus className="h-4 w-4" />
                Registrar Pago
              </Button>
            </div>
          </CardContent>
        </Card>

        <TableView />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar pago?"
        message="Esta acción eliminará el pago definitivamente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
