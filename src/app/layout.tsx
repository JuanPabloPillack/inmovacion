// src/app/layout.tsx
import "./globals.css"; 
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}