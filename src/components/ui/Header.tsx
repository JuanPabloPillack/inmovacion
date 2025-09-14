// src/components/ui/Header.tsx

"use client";

import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, User, Home, CreditCard, FileText, FileSignature, Settings, DollarSign, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules: [string, string, any][] = [
    ["Clientes", "/clientes", User],
    ["Propiedades", "/propiedades", Home],
    ["Pagos", "/pagos", CreditCard],
    ["Rendiciones", "/rendiciones", FileText],
    ["Contratos", "/contratos", FileSignature],
    ["Servicios", "/servicios", Settings],
    ["Cobranzas", "/cobranzas", DollarSign],
    ["Usuarios", "/usuarios", Users],
  ];

  // Inspeccionar la sesión para depuración
  console.log("Session:", session);

  const handleUserSettingsClick = () => {
    if (session?.user?.id) {
      router.push("/usuarios/perfil"); // Cambiar a /usuarios/perfil
    } else {
      setError("No se pudo cargar la configuración del usuario.");
      setTimeout(() => setError(null), 3000); // Ocultar alerta después de 3s
    }
  };

  return (
    <>
      <header className="w-full bg-white px-6 py-3 flex justify-between items-center border-b border-[#969696] relative z-10">
        <div className="flex-1 flex justify-center space-x-6 font-medium">
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#63bae9] transition-colors cursor-pointer"
          >
            Inicio
          </button>
          
        </div>

        <div className="absolute right-6 flex items-center space-x-2">
          {session ? (
            <>
              <Button
                variant="outline"
                size="icon"
                className="border-[#686363] text-[#686363] hover:border-[#63bae9] hover:text-[#63bae9] cursor-pointer"
                onClick={handleUserSettingsClick}
                title="Ver perfil"
                disabled={!session?.user?.id} // Deshabilitar si no hay ID
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-[#686363] text-[#686363] hover:border-[#63bae9] hover:text-[#63bae9] cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn()}
              className="bg-[#63bae9] text-white hover:bg-[#fcc238] transition-colors font-semibold cursor-pointer"
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="absolute top-16 right-6 max-w-sm shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {session && (
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-[#969696] shadow-lg transform transition-transform duration-300 z-50 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#63bae9] mb-4 border-b border-[#e5e5e5] pb-2">
              Módulos
            </h2>

            {modules.map(([label, path, Icon]) => (
              <button
                key={path}
                onClick={() => {
                  router.push(path);
                  setMenuOpen(false);
                }}
                className="px-4 py-3 rounded-md hover:bg-[#63bae9] hover:text-white transition-colors font-semibold text-left flex items-center gap-2"
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}

            <button
              onClick={() => {
                signOut({ redirect: true, callbackUrl: "/" });
                setMenuOpen(false);
              }}
              className="px-4 py-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold text-left mt-4 flex items-center gap-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}