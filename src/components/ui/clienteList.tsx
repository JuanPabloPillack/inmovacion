'use client';

import React, { useState, useTransition, useEffect } from "react";
import { getClients, toggleClientStatus } from "@/actions/client-action";
import { Button } from "@/components/ui/button";

interface ClientItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
}

export const ClienteList: React.FC = () => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadClients = () => {
    startTransition(async () => {
      const data = await getClients();
      const mappedClients: ClientItem[] = data.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: client.role,
        status: client.status,
      }));
      setClients(mappedClients);
    });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleToggleStatus = async (id: string) => {
    startTransition(async () => {
      await toggleClientStatus(id);
      loadClients();
    });
  };

  return (
    <div className="space-y-2">
      {clients.map(client => (
        <div key={client.id} className="flex justify-between items-center border p-2 rounded-md">
          <div>
            <p className="font-semibold">{client.name}</p>
            <p className="text-sm">{client.email}</p>
            <p className="text-sm">{client.phone}</p>
            <p className="text-xs text-gray-500">{client.role}</p>
          </div>
          <Button
            variant="destructive"
            onClick={() => handleToggleStatus(client.id)}
          >
            {client.status === "ACTIVE" ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ))}
    </div>
  );
};
