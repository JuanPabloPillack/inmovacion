// Archivo: src/app/usuarios/page.tsx
// Descripción: Página para gestionar usuarios (listado y creación).
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, UserCheck, UserX, Trash2, Users, Filter, AlertTriangle, X } from "lucide-react"
import { getUsers } from "@/actions/getUsers"
import Header from "@/components/ui/Header"
import { deactivateUser, deleteUser, activateUser } from "@/actions/user-actions"
import type { User } from "../../../../types/user"
import Loading from "@/components/ui/Loading"
import ConfirmationModal from "@/components/ui/confirmation-modal"

export default function UsersPage() {
  const { data: session, status } = useSession()
  const loggedInUserEmail = session?.user?.email
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'delete' | 'deactivate' | 'activate' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.status === "active") ||
        (filterStatus === "inactive" && user.status === "inactive")
      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, filterStatus])

  const refreshUsers = useCallback(async () => {
    try {
      const usersData = await getUsers()
      const validUsers: User[] = usersData.map((user: any) => ({
        id: user.id,
        name: user.name || "Sin nombre",
        email: user.email || "sin@email.com",
        phone: user.phone || undefined,
        role: user.role || "user",
        status: user.status || "active",
        password: user.password || "sincontraseña",
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
      }))
      setUsers(validUsers)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    }
  }, [])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/")
      return
    }
    if (session.user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchUsers = async () => {
      try {
        await refreshUsers()
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [session, status, router, refreshUsers])

  const handleDelete = useCallback(
    (id: string) => {
      setUserId(id)
      setActionType('delete')
      setIsModalOpen(true)
    },
    []
  )

  const handleDeactivate = useCallback(
    (id: string) => {
      setUserId(id)
      setActionType('deactivate')
      setIsModalOpen(true)
    },
    []
  )

  const handleActivate = useCallback(
    (id: string) => {
      setUserId(id)
      setActionType('activate')
      setIsModalOpen(true)
    },
    []
  )

  const handleConfirmAction = useCallback(async () => {
    if (!userId || !actionType) return

    try {
      if (actionType === 'delete') {
        await deleteUser(userId)
      } else if (actionType === 'deactivate') {
        await deactivateUser(userId)
      } else if (actionType === 'activate') {
        await activateUser(userId)
      }
      await refreshUsers()
    } catch (error) {
      console.error(`Error en acción ${actionType}:`, error)
    }
    setIsModalOpen(false)
    setActionType(null)
    setUserId(null)
  }, [userId, actionType, refreshUsers])

  if (loading) {
    return <Loading message="Cargando usuarios..." />
  }

  const TableView = () => (
    <Card className="shadow-lg border-[#969696]/20">
      <CardHeader className="pb-4 bg-gradient-to-r from-[#63bae9]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#63bae9]" />
            <CardTitle className="text-xl text-[#686363]">Lista de Usuarios</CardTitle>
          </div>
          <Badge variant="secondary" className="text-sm bg-[#969696]/10 text-[#686363] border-[#969696]/30">
            {filteredUsers.length} usuarios
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#969696]/20">
              <TableHead className="text-[#686363] font-medium">Usuario</TableHead>
              <TableHead className="text-[#686363] font-medium">Contacto</TableHead>
              <TableHead className="text-[#686363] font-medium">Rol</TableHead>
              <TableHead className="text-[#686363] font-medium">Estado</TableHead>
              <TableHead className="text-[#686363] font-medium">Fecha Creación</TableHead>
              <TableHead className="text-right text-[#686363] font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-[#63bae9]/5 border-[#969696]/10">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-[#686363]">{user.name}</span>
                    <span className="text-sm text-[#969696]">ID: {user.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#686363]">{user.email}</span>
                    <span className="text-sm text-[#969696]">{user.phone || "Sin teléfono"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className={
                      user.role === "admin"
                        ? "bg-[#63bae9] text-white hover:bg-[#63bae9]/90"
                        : "bg-[#969696]/20 text-[#686363] hover:bg-[#969696]/30"
                    }
                  >
                    {user.role === "admin" ? "Administrador" : "Usuario"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                    className={
                      user.status === "active"
                        ? "bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
                        : "bg-[#969696]/20 text-[#686363] hover:bg-[#969696]/30"
                    }
                  >
                    {user.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-[#969696]">
                  {new Date(user.createdAt).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#63bae9]/10 text-[#686363]">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-[#969696]/20">
                      <DropdownMenuItem
                        onClick={() => router.push(`/usuarios/${user.id}`)}
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/usuarios/editar?id=${user.id}`)}
                        className="text-[#686363] hover:bg-[#63bae9]/10 hover:text-[#63bae9]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {user.status === "active" ? (
                        user.email === loggedInUserEmail ? (
                          <DropdownMenuItem
                            className="text-[#969696] cursor-not-allowed"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            No puedes desactivarte
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(user.id)}
                            className="text-[#fcc238] hover:bg-[#fcc238]/10"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Desactivar
                          </DropdownMenuItem>
                        )
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleActivate(user.id)}
                            className="text-[#63bae9] hover:bg-[#63bae9]/10"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-[#fcc238] hover:bg-[#fcc238]/10 focus:text-[#fcc238]"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUsers.map((user) => (
        <Card
          key={user.id}
          className="hover:shadow-lg transition-shadow duration-200 border-[#969696]/20 hover:border-[#63bae9]/30"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-[#686363]">{user.name}</CardTitle>
                <p className="text-sm text-[#969696]">{user.email}</p>
              </div>
              <Badge
                variant={user.status === "active" ? "default" : "destructive"}
                className={user.status === "active" ? "bg-[#fcc238] text-[#686363]" : "bg-[#969696]/20 text-[#686363]"}
              >
                {user.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#969696]">Rol:</span>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className={user.role === "admin" ? "bg-[#63bae9] text-white" : "bg-[#969696]/20 text-[#686363]"}
              >
                {user.role === "admin" ? "Admin" : "Usuario"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#969696]">Teléfono:</span>
              <span className="text-[#686363]">{user.phone || "No registrado"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#969696]">Creado:</span>
              <span className="text-[#686363]">{new Date(user.createdAt).toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/usuarios/${user.id}`)}
                className="flex-1 border-[#63bae9] text-[#63bae9] hover:bg-[#63bae9] hover:text-white"
              >
                <Eye className="mr-1 h-3 w-3" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/usuarios/editar?id=${user.id}`)}
                className="flex-1 border-[#63bae9] text-[#63bae9] hover:bg-[#63bae9] hover:text-white"
              >
                <Edit className="mr-1 h-3 w-3" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#969696]/50 text-[#686363] hover:bg-[#969696]/10 bg-transparent"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-[#969696]/20">
                  {user.status === "active" ? (
                    user.email === loggedInUserEmail ? (
                      <DropdownMenuItem
                        className="text-[#969696] cursor-not-allowed"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        No puedes desactivarte
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleDeactivate(user.id)}
                        className="text-[#fcc238] hover:bg-[#fcc238]/10"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Desactivar
                      </DropdownMenuItem>
                    )
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleActivate(user.id)}
                        className="text-[#63bae9] hover:bg-[#63bae9]/10"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="text-[#fcc238] hover:bg-[#fcc238]/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-[#63bae9]" />
            <h1 className="text-3xl font-bold text-balance text-[#686363]">Gestión de Usuarios</h1>
          </div>
          <p className="text-[#969696]">Administra los usuarios del sistema inmobiliario</p>
        </div>

        <Card className="mb-6 border-[#969696]/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#969696] h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#969696]/30 focus:border-[#63bae9] text-[#686363]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#969696]" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-md border border-[#969696]/30 bg-background text-sm text-[#686363] focus:border-[#63bae9]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={
                    viewMode === "table"
                      ? "bg-[#63bae9] text-white hover:bg-[#63bae9]/90"
                      : "border-[#63bae9] text-[#63bae9] hover:bg-[#63bae9] hover:text-white"
                  }
                >
                  Tabla
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className={
                    viewMode === "cards"
                      ? "bg-[#63bae9] text-white hover:bg-[#63bae9]/90"
                      : "border-[#63bae9] text-[#63bae9] hover:bg-[#63bae9] hover:text-white"
                  }
                >
                  Tarjetas
                </Button>
              </div>
              <Button
                onClick={() => router.push("/usuarios/nuevo")}
                className="gap-2 bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90 font-medium"
              >
                <Plus className="h-4 w-4" />
                Crear Usuario
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 ? (
          <Card className="border-[#969696]/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-[#969696] mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#686363]">No se encontraron usuarios</h3>
              <p className="text-[#969696] text-center">
                {searchTerm || filterStatus !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer usuario"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={() => router.push("/usuarios/nuevo")}
                  className="mt-4 gap-2 bg-[#fcc238] text-[#686363] hover:bg-[#fcc238]/90"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primer Usuario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <TableView />
        ) : (
          <CardsView />
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setActionType(null)
            setUserId(null)
          }}
          onConfirm={handleConfirmAction}
          title={
            actionType === 'delete' ? "¿Estás seguro de eliminar este usuario?" :
            actionType === 'deactivate' ? "¿Estás seguro de desactivar este usuario?" :
            actionType === 'activate' ? "¿Estás seguro de activar este usuario?" :
            "¿Estás seguro?"
          }
          message={
            actionType === 'delete' ? "Esta acción eliminará permanentemente el usuario y no se podrá deshacer." :
            actionType === 'deactivate' ? "El usuario no podrá acceder al sistema hasta que se reactive." :
            actionType === 'activate' ? "El usuario podrá acceder nuevamente al sistema." :
            "Esta acción no se puede deshacer."
          }
          confirmText={
            actionType === 'delete' ? "Eliminar" :
            actionType === 'deactivate' ? "Desactivar" :
            actionType === 'activate' ? "Activar" :
            "Confirmar"
          }
          cancelText="Cancelar"
          variant={actionType === 'delete' ? 'danger' : 'warning'}
        />
      </div>
    </div>
  )
}