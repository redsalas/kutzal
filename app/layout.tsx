import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";

const flowers = localFont({
  src: [
    { path: "../public/fonts/FlowersOfNineties-Regular.woff2",    weight: "400", style: "normal" },
    { path: "../public/fonts/FlowersOfNineties-Extralight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/FlowersOfNineties-XlightItalic.woff2", weight: "200", style: "italic" },
  ],
  variable: "--font-flowers",
});

const trevia = localFont({
  src: [
    { path: "../public/fonts/TreviaGroteska-Regular.woff2",        weight: "400", style: "normal" },
    { path: "../public/fonts/TreviaGroteska-Regular-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-trevia",
});

export const metadata: Metadata = {
  title: "Kutzal - Pilates Clásico",
  description: "Studio de Pilates Clásico - Transforma tu cuerpo y mente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${flowers.variable} ${trevia.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}


