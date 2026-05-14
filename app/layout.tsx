import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eliza Studio",
  description:
    "Boutique digital para presentar catalogos, colecciones y novedades con una presencia elegante.",
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
