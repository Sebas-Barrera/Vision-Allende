"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ onToggleSidebar }) {
  const router = useRouter();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const manejarCerrarSesion = async () => {
    try {
      const respuesta = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (respuesta.ok) {
        // Redirigir a login
        router.push("/login");
        router.refresh(); // Refrescar para limpiar estado
      } else {
        console.error("Error cerrando sesión");
      }
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      // En caso de error, forzar redirección
      router.push("/login");
    }
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-neutral-200">
      {/* Botón menú mobile */}
      <button
        className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-optica-500 lg:hidden"
        onClick={onToggleSidebar}
      >
        <span className="sr-only">Abrir sidebar</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Breadcrumb o título de página */}
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-neutral-900">
            Sistema de Gestión
          </h2>
        </div>

        {/* Área derecha */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Botones de acceso rápido */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/clientes/nuevo"
              className="btn btn-primary btn-sm"
              title="Nuevo Cliente"
            >
              👤 Cliente
            </Link>

            <Link
              href="/clientes"
              className="btn btn-secondary btn-sm"
              title="Ver Clientes"
            >
              👥 Clientes
            </Link>

            <Link
              href="/ventas"
              className="btn btn-secondary btn-sm"
              title="Ver Ventas"
            >
              🛒 Ventas
            </Link>

            <Link
              href="/periodos"
              className="btn btn-secondary btn-sm"
              title="Gestión de Períodos"
            >
              📅 Períodos
            </Link>
          </div>

          {/* Notificaciones */}
          <button className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-optica-500">
            <span className="sr-only">Ver notificaciones</span>
            <div className="relative">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM15 17H9a4 4 0 01-4-4V9a4 4 0 014-4h4m2 0V3a1 1 0 011-1h2a1 1 0 011 1v2m0 0a1 1 0 01-1 1H16a1 1 0 01-1-1m0 0V3"
                />
              </svg>
              {/* Indicador de notificaciones */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </div>
          </button>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-optica-500"
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="h-8 w-8 rounded-full bg-optica-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <span className="hidden md:ml-3 md:block text-neutral-700 font-medium">
                Administrador
              </span>
              <svg
                className="hidden md:block ml-2 h-4 w-4 text-neutral-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown del menú de usuario */}
            {menuUsuarioAbierto && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-neutral-700 border-b border-neutral-100">
                    <p className="font-medium">Administrador</p>
                    <p className="text-neutral-500">admin@optica.com</p>
                  </div>

                  <button className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    ⚙️ Configuración
                  </button>

                  <button className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    👤 Mi Perfil
                  </button>

                  <div className="border-t border-neutral-100"></div>

                  <button
                    onClick={manejarCerrarSesion}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cerrar menú al hacer clic fuera */}
      {menuUsuarioAbierto && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuUsuarioAbierto(false)}
        />
      )}
    </div>
  );
}
