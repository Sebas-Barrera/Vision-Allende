"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    clientes: 0,
    ventas: 0,
    pendientes: 0,
    ingresos: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Por ahora datos de ejemplo, después conectaremos con las APIs reales
      setTimeout(() => {
        setEstadisticas({
          clientes: 125,
          ventas: 89,
          pendientes: 12,
          ingresos: 45680.0,
        });
        setCargando(false);
      }, 1000);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setCargando(false);
    }
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(cantidad);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#095a6d] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Título */}
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl">
                <img
                  src="/logo.png"
                  alt="Visión Allende Óptica"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-[#095a6d] bg-clip-text text-transparent">
                  Visión Allende
                </h1>
                <p className="text-sm text-gray-500 font-medium">Sistema de Gestión</p>
              </div>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/clientes"
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Clientes
              </Link>
              <Link
                href="/ventas"
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Ventas
              </Link>
              <Link
                href="/periodos"
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Períodos
              </Link>
              <Link
                href="/reportes"
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Reportes
              </Link>
            </nav>

            {/* Botón Logout */}
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenido al Sistema
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Gestiona tu óptica de manera eficiente con herramientas diseñadas para optimizar tu flujo de trabajo
            </p>
          </div>

          {/* Estadísticas Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-all duration-300 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{estadisticas.clientes}</p>
                <p className="text-gray-600 font-medium">Clientes Registrados</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-all duration-300 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5M17 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mes</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{estadisticas.ventas}</p>
                <p className="text-gray-600 font-medium">Ventas Realizadas</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-all duration-300 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pendientes</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{estadisticas.pendientes}</p>
                <p className="text-gray-600 font-medium">Órdenes Pendientes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] border border-transparent rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80 uppercase tracking-wide">Ingresos</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">
                  {formatearMoneda(estadisticas.ingresos)}
                </p>
                <p className="text-white/80 font-medium">Total del Mes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Acciones Rápidas
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              Accede rápidamente a las funciones más utilizadas del sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nuevo Cliente */}
            <Link
              href="/clientes/nuevo"
              className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-900 rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group block"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Nuevo Cliente
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Registrar un cliente y generar expediente
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm font-medium text-[#095a6d]">
                      Acceder
                    </span>
                    <svg 
                      className="w-4 h-4 text-[#095a6d] group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Ver Clientes */}
            <Link
              href="/clientes"
              className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-900 rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group block"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Ver Clientes
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Gestionar base de datos de clientes
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm font-medium text-[#095a6d]">
                      Acceder
                    </span>
                    <svg 
                      className="w-4 h-4 text-[#095a6d] group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Nueva Venta */}
            <Link
              href="/ventas"
              className="bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] hover:from-[#0a4a5c] hover:to-[#095a6d] text-white rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group block"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5M17 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Nueva Venta
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Crear orden de venta de lentes
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm font-medium text-white/90">
                      Acceder
                    </span>
                    <svg 
                      className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Reportes */}
            <Link
              href="/reportes"
              className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-900 rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group block"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Reportes
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Generar reportes y estadísticas
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm font-medium text-[#095a6d]">
                      Acceder
                    </span>
                    <svg 
                      className="w-4 h-4 text-[#095a6d] group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8 border-t border-gray-200/50">
          <p className="text-gray-500 text-sm">
            Sistema de gestión integral para óptica • Diseñado para optimizar tu flujo de trabajo
          </p>
        </div>
      </main>
    </div>
  );
}