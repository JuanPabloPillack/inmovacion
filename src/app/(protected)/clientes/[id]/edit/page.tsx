"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { getClients, updateClient } from "../../../../../actions/client-action"

type ClientType = "PROPIETARIO" | "COMPRADOR" | "INQUILINO";
type ClientStatus = "ACTIVE" | "INACTIVE";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: ClientType;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}
interface EditClientPageProps {
  params: { id: string }
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [type, setType] = useState<Client["type"]>("PROPIETARIO")

  useEffect(() => {
    async function loadClient() {
      const clients = await getClients()
      const c = clients.find((c) => c.id === params.id)
      if (c) {
        setClient(c)
        setFirstName(c.firstName)
        setLastName(c.lastName)
        setEmail(c.email)
        setPhone(c.phone || "")
        setType(c.type)
      }
    }
    loadClient()
  }, [params.id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await updateClient(params.id, { firstName, lastName, email, phone, type })
    router.push("/clientes")
  }

  if (!client) return <div>Cargando...</div>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Editar Cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Client["type"])}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="PROPIETARIO">Propietario</option>
            <option value="COMPRADOR">Comprador</option>
            <option value="INQUILINO">Inquilino</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => router.push("/clientes")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
