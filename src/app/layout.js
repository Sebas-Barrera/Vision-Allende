import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Visión Allende - Sistema de Gestión",
  description: "Sistema integral de gestión para óptica Visión Allende - Clientes, ventas y reportes",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico", 
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <head>
        {/* Múltiples referencias al favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/nerd-glasses.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/nerd-glasses.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/nerd-glasses.png" />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-neutral-50">{children}</div>
      </body>
    </html>
  );
}