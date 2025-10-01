"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { getClients, searchClients, toggleClientStatus } from "@/actions/client-action"
import type { Client } from "../../../../types/client"
import { Button } from "@/components/ui/button"

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchField, setSearchField] = useState<keyof Pick<Client, "firstName" | "lastName" | "email" | "type">>("firstName")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function load() {
      const data = await getClients()
      setClients(data)
    }
    load()
  }, [])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!searchQuery) {
      setClients(await getClients())
    } else {
      const data = await searchClients(searchField, searchQuery)
      setClients(data)
    }
  }

  async function handleDelete(id: string) {
    const updated = await toggleClientStatus(id)
    setClients(clients.map((c) => (c.id === id ? updated : c)))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {/* Formulario de búsqueda y botón de nuevo */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as typeof searchField)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="firstName">Nombre</option>
            <option value="lastName">Apellido</option>
            <option value="email">Email</option>
            <option value="type">Tipo</option>
          </select>

          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
            Buscar
          </Button>

          <Button
            type="button"
            onClick={async () => setClients(await getClients())}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Todos
          </Button>
        </form>

        <Link
          href="/clientes/new"
          className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Nuevo Cliente
        </Link>
      </div>

      {/* Tabla de clientes */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Nombre</th>
              <th className="border px-3 py-2 text-left">Apellido</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Teléfono</th>
              <th className="border px-3 py-2 text-left">Tipo</th>
              <th className="border px-3 py-2 text-left">Estado</th>
              <th className="border px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className={c.status === "INACTIVE" ? "opacity-50" : ""}>
                <td className="border px-3 py-2">{c.firstName}</td>
                <td className="border px-3 py-2">{c.lastName}</td>
                <td className="border px-3 py-2">{c.email}</td>
                <td className="border px-3 py-2">{c.phone || "-"}</td>
                <td className="border px-3 py-2">{c.type}</td>
                <td className="border px-3 py-2">{c.status}</td>
                <td className="border px-3 py-2 flex gap-2">
                  <Link
                    href={`/clientes/${c.id}/edit`}
                    className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded-md text-white"
                  >
                    Editar
                  </Link>
                  <Button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
