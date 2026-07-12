import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Bowlby_One_SC } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const bowlbyOneSC = Bowlby_One_SC({
  variable: "--font-bowlby",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Comunidad de Acordeoneros | Acordeón y Mentalidad",
    template: "%s | Comunidad de Acordeoneros",
  },
  description:
    "Aprende acordeón con programas estructurados y desarrolla la mentalidad que necesitas para destacar. Cursos, técnica y comunidad.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${bowlbyOneSC.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
