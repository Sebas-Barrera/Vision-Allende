'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const pathname = usePathname()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const menuItems = [
    {
      nombre: 'Dashboard',
      href: '/',
      icono: '🏠',
      activo: pathname === '/'
    },
    {
      nombre: 'Clientes',
      href: '/clientes',
      icono: '👥',
      activo: pathname.startsWith('/clientes')
    },
    {
      nombre: 'Ventas',
      href: '/ventas',
      icono: '🛍️',
      activo: pathname.startsWith('/ventas')
    },
    {
      nombre: 'Reportes',
      href: '/reportes',
      icono: '📊',
      activo: pathname.startsWith('/reportes')
    }
  ]

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-neutral-200">
            {/* Logo */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 bg-optica-600">
              <div className="flex items-center">
                <span className="text-2xl">👓</span>
                <h1 className="ml-2 text-xl font-bold text-white">
                  Sistema Óptica
                </h1>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.nombre}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      item.activo
                        ? 'bg-optica-50 text-optica-700 border-r-2 border-optica-500'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icono}</span>
                    {item.nombre}
                  </Link>
                ))}
              </nav>

              {/* Información del usuario */}
              <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-optica-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-700">Admin</p>
                    <p className="text-xs text-neutral-500">Administrador</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarAbierto && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-600 bg-opacity-75"
            onClick={() => setSidebarAbierto(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            {/* Logo Mobile */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-optica-600">
              <span className="text-2xl">👓</span>
              <h1 className="ml-2 text-lg font-bold text-white">Sistema Óptica</h1>
              <button
                className="ml-auto text-white hover:text-neutral-200"
                onClick={() => setSidebarAbierto(false)}
              >
                ✕
              </button>
            </div>

            {/* Navegación Mobile */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.nombre}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.activo
                        ? 'bg-optica-50 text-optica-700'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setSidebarAbierto(false)}
                  >
                    <span className="mr-3 text-xl">{item.icono}</span>
                    {item.nombre}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)} />

        {/* Contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}