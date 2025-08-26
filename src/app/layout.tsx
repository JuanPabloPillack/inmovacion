import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-200">
        {/* Header */}
        <header className="main-header flex items-center justify-between px-6 py-4 bg-gray-700 text-white">
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
        <footer className="main-footer bg-gray-700 text-white text-center py-4 mt-8">
          <p>© 2025 GBS&Asociados</p>
        </footer>
      </body>
    </html>
  );
}
