// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/QueryProvider";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionProvider>
<QueryProvider>
          {children}
        </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
