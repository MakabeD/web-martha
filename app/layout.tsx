import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalogo de eliza",
  description: "Catalogo de disponibilidad de productos de eliza.",
  icons: "/logo2.jpeg",
  openGraph: {
    title: "Catálogo de Eliza",
    description: "Catálogo de disponibilidad de productos de Eliza.",
    url: "https://catalogo-eliza.vercel.app",
    siteName: "Catálogo de Eliza",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Catálogo de Eliza",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
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
