import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Departamento de Identificaciones | San Ignacio",
  description:
    "Portal oficial de la Oficina Regional del Departamento de Identificaciones de San Ignacio, Misiones.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
