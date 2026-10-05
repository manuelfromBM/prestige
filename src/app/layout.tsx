import "./globals.css";
import { Inter, Barlow_Condensed } from "next/font/google";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barbería · Más que un corte, una experiencia",
  description:
    "Barberos certificados, productos premium y asesoría de imagen personalizada. Agenda tu hora y transforma tu estilo.",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Condensed({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}