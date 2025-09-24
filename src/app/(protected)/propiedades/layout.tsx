import "./estilos.css";
import Image from "next/image";
import Link from "next/link";

export default function PropiedadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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

      <main className="main-content max-w-6xl mx-auto py-8 px-4">{children}</main>

      <footer className="main-footer">
        <p>© 2025 GBS&Asociados</p>
      </footer>
    </>
  );
}
