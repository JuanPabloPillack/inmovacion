'use client'

import React from 'react'
import { Client } from '../../../types/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ClienteTableProps {
  clients: Client[]
  onDelete: (id: string) => void
}

export const ClienteTable: React.FC<ClienteTableProps> = ({ clients, onDelete }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">Nombre</th>
          <th className="border px-2 py-1">Apellido</th>
          <th className="border px-2 py-1">Email</th>
          <th className="border px-2 py-1">Teléfono</th>
          <th className="border px-2 py-1">Tipo</th>
          <th className="border px-2 py-1">Estado</th>
          <th className="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id} className={c.status === 'INACTIVE' ? 'opacity-50' : ''}>
            <td className="border px-2 py-1">{c.firstName}</td>
            <td className="border px-2 py-1">{c.lastName}</td>
            <td className="border px-2 py-1">{c.email}</td>
            <td className="border px-2 py-1">{c.phone || '-'}</td>
            <td className="border px-2 py-1">{c.type}</td>
            <td className="border px-2 py-1">{c.status}</td>
            <td className="border px-2 py-1 flex gap-1">
              <Link href={`/clientes/${c.id}/edit`} className="bg-yellow-400 px-2 py-1 rounded">
                Editar
              </Link>
              <Button
                onClick={() => onDelete(c.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
