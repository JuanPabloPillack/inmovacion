// Archivo: src/components/ui/EnDesarrollo.tsx
// Descripción: Componente que muestra un mensaje de "En Desarrollo" con un botón para volver al inicio.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EnDesarrolloProps {
  titulo?: string;
}

const EnDesarrollo: React.FC<EnDesarrolloProps> = ({ titulo }) => {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center text-center space-y-6 border border-[#e5e5e5]">
        <h1 className="text-4xl md:text-5xl font-bold text-[#63bae9]">
          {titulo || 'Módulo'}
        </h1>
        <p className="text-lg md:text-xl text-[#ff6b6b] font-semibold">
          Estamos aún en desarrollo, se agradece su paciencia.
        </p>

        {/* Botón para volver al inicio */}
        <Button
          onClick={() => router.push('/')}
          className="bg-[#63bae9] hover:bg-[#4da8d6] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default EnDesarrollo;
