"use client";

import { useState } from "react";
import Link from "next/link";
import GestionPeriodos from "@/components/periodos/GestionPeriodos";

export default function PaginaPeriodos() {
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
                  <p className="text-sm text-gray-500 font-medium">Períodos Contables</p>
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
              <Link href="/ventas" className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium">
                Ventas
              </Link>
              <Link
                href="/periodos"
                className="px-4 py-2 text-[#095a6d] bg-[#095a6d]/10 rounded-lg font-medium"
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#095a6d] transition-colors">
              Dashboard
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Períodos</span>
          </nav>
        </div>

        {/* Encabezado */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Períodos Contables
              </h2>
              <p className="text-gray-600 text-lg">
                Control mensual de períodos para reportes al contador
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 md:ml-4 md:mt-0">
              <Link href="/reportes" className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
                Ver Reportes
              </Link>
              <Link href="/" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#095a6d] to-[#0a4a5c] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10M1 21h4m0 0h6m0 0h4m-9-4a1 1 0 011-1h2a1 1 0 011 1v.01" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Información sobre Períodos Contables
              </h3>
              <div className="text-blue-800 space-y-2 text-sm leading-relaxed">
                <p className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  Los períodos van del día 7 de un mes al día 6 del siguiente mes
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  Solo se puede cerrar un período entre los días 5 y 10 de cada mes
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  Al cerrar un período, las ventas con saldo pendiente se migran al nuevo período
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  En el nuevo período: saldo pendiente → nuevo costo total, depósitos → $0
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  Esta función está diseñada para generar reportes mensuales al contador
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión de períodos */}
        <div className="mb-8">
          <GestionPeriodos />
        </div>

        {/* Accesos rápidos */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/ventas"
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5" />
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#095a6d] transition-colors">
                  Generar Reportes
                </h4>
                <p className="text-sm text-gray-600">
                  Reportes para el contador
                </p>
              </div>
            </Link>

            <Link
              href="/clientes"
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#095a6d] transition-colors">
                  Ver Clientes
                </h4>
                <p className="text-sm text-gray-600">
                  Clientes con saldos pendientes
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}