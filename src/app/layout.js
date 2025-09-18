import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Visión Allende - Sistema de Gestión",
  description:
    "Sistema integral de gestión para óptica Visión Allende - Clientes, ventas y reportes",
  icons: {
    icon: "/nerd-glasses.png", // favicon principal
    shortcut: "/nerd-glasses.png", // para navegadores antiguos (opcional)
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-neutral-50">{children}</div>
      </body>
    </html>
  );
}
