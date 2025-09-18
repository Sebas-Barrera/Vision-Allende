"use client";

import { useState } from "react";
import Link from "next/link";
import GeneradorReportes from "@/components/reportes/GeneradorReportes";

export default function PaginaReportes() {
  const [mostrarInfo, setMostrarInfo] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Título */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
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
                  <p className="text-sm text-gray-500 font-medium">
                    Reportes para Contador
                  </p>
                </div>
              </Link>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </Link>
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
                className="px-4 py-2 text-[#095a6d] bg-[#095a6d]/10 rounded-lg font-medium"
              >
                Reportes
              </Link>
            </nav>

            {/* Botón Logout */}
            <button
              onClick={() => {
                fetch("/api/auth/logout", { method: "POST" }).then(
                  () => (window.location.href = "/login")
                );
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#095a6d] transition-colors">
              Dashboard
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-900 font-medium">Reportes</span>
          </nav>
        </div>

        {/* Encabezado */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Reportes para Contador
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Genera reportes Excel desglosados para enviar al contador cada
                día 7 del mes
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 md:ml-4 md:mt-0">
              <Link
                href="/periodos"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Gestionar Períodos
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#095a6d] to-[#0a4a5c] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10M1 21h4m0 0h6m0 0h4m-9-4a1 1 0 011-1h2a1 1 0 011 1v.01"
                  />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Información importante */}
        {mostrarInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Información sobre Reportes
                  </h3>
                </div>

                <div className="text-blue-800 space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p>
                      <strong>Reporte General:</strong> Todas las ventas del
                      período con información completa
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-green-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p>
                      <strong>Reporte Efectivo:</strong> Solo depósitos pagados
                      en efectivo
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-purple-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <p>
                      <strong>Reporte Tarjeta:</strong> Solo depósitos pagados
                      con tarjeta
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-orange-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                    </div>
                    <p>
                      <strong>Reporte Transferencia:</strong> Solo depósitos por
                      transferencia bancaria
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p>
                      <strong> Reporte Completo: </strong> Un archivo Excel con
                      todas las hojas separadas (recomendado)
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-100 rounded-xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-blue-900">
                      Flujo de Trabajo Recomendado (cada día 7):
                    </h4>
                  </div>
                  <div className="text-blue-800 text-sm space-y-1.5">
                    <p className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1 font-bold">
                        1.
                      </span>
                      Descargar <strong>Reporte Completo</strong> del período
                      que termina
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1 font-bold">
                        2.
                      </span>
                      Enviar archivo Excel al contador
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1 font-bold">
                        3.
                      </span>
                      Ir a <strong>Períodos</strong> y cerrar el período
                      anterior
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1 font-bold">
                        4.
                      </span>
                      El sistema creará automáticamente el nuevo período
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMostrarInfo(false)}
                className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                aria-label="Ocultar información"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Generador de reportes */}
        <div className="mb-8">
          <GeneradorReportes />
        </div>

        {/* Accesos rápidos */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/ventas"
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#095a6d] transition-colors">
                  Ver Ventas
                </h4>
                <p className="text-sm text-gray-600">
                  Revisar ventas del período actual
                </p>
              </div>
            </Link>

            <Link
              href="/reportes"
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#095a6d] transition-colors">
                  Generar Reportes
                </h4>
                <p className="text-sm text-gray-600">
                  Exportar datos para el contador
                </p>
              </div>
            </Link>

            <Link
              href="/clientes"
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#095a6d] transition-colors">
                  Gestionar Clientes
                </h4>
                <p className="text-sm text-gray-600">
                  Ver clientes con saldos pendientes
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Tips adicionales */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Tips para el Contador
              </h3>
              <div className="text-amber-800 space-y-3 text-sm">
                <p className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">•</span>
                  El <strong> Reporte Completo </strong> incluye múltiples hojas
                  en un solo archivo Excel
                </p>
                <p className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">•</span>
                  Los reportes separados por método de pago facilitan la
                  conciliación bancaria
                </p>
                <p className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">•</span>
                  Cada reporte incluye fechas exactas y números de venta para
                  trazabilidad
                </p>
                <p className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">•</span>
                  Los saldos pendientes del período anterior aparecerán como
                  nuevas ventas en el siguiente período
                </p>
                <p className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">•</span>
                  Todos los montos están en pesos mexicanos (MXN)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
