"use client";

import Header from "../components/ui/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      {/* Header */}
      <Header />

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