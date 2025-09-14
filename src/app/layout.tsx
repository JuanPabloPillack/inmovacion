// src/app/layout.tsx
import "./globals.css"; // 👈 asegurate de tener esto
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
    <html lang="es">
      <body>
        {/* Header */}
        <header className="main-header">
          <div className="logo flex items-center">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={120} height={50} priority />
            </Link>
          </div>
          <nav className="menu">
            <ul className="flex gap-6 font-medium">
              <li>
                <Link href="/inicio" className="hover:underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/" className="font-bold underline">
                  Propiedades
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:underline">
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Contenido */}
        <main className="main-content max-w-6xl mx-auto py-8 px-4">{children}</main>

        {/* Footer */}
        <footer className="main-footer">
          <p>© 2025 GBS&Asociados</p>
        </footer>
      </body>
    </html>
  );
}