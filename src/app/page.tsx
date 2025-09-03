"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, User, Home, CreditCard, FileText, FileSignature, Settings, DollarSign, Users } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      {/* Header */}
      <header className="w-full bg-white px-6 py-3 flex justify-between items-center border-b border-[#969696] relative z-10">
        <div className="flex-1 flex justify-center space-x-6 font-medium">
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#63bae9] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/propiedades")}
            className="hover:text-[#63bae9] transition-colors cursor-pointer"
          >
            Propiedades
          </button>
          <button
            onClick={() => router.push("/servicios")}
            className="hover:text-[#63bae9] transition-colors cursor-pointer"
          >
            Servicios
          </button>
        </div>

        {/* Botón derecho */}
        <div className="absolute right-6">
          {session ? (
            <Button
              variant="outline"
              size="icon"
              className="border-[#686363] text-[#686363] hover:border-[#63bae9] hover:text-[#63bae9] cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
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

      {/* Sidebar lateral derecho */}
      {session && (
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-[#969696] shadow-lg transform transition-transform duration-300 z-50 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 flex flex-col gap-2">
            {/* Título "Módulos" */}
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

      {/* Overlay semi-transparente */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Hero / Contenido principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center text-center space-y-6 border border-[#e5e5e5]">
          <h1 className="text-4xl md:text-5xl font-bold text-[#63bae9]">
            De parte del equipo de Sistemas
          </h1>
          <p className="text-lg md:text-xl text-[#ff6b6b] font-semibold">
            Estamos aún en desarrollo, se agradece su paciencia.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#63bae9] text-white py-6 text-center mt-auto">
        <p className="text-sm">
          © 2025 Inmovación - GBS y Asociados. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
