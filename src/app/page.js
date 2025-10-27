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
  const [estadisticasDetalladas, setEstadisticasDetalladas] = useState({
    por_estado: {},
    mes_actual: {},
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/estadisticas", {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();

        setEstadisticas({
          clientes: datos.estadisticas_generales.clientes,
          ventas: datos.estadisticas_generales.ventas,
          pendientes: datos.estadisticas_generales.pendientes,
          ingresos: datos.estadisticas_generales.ingresos,
        });

        setEstadisticasDetalladas({
          por_estado: datos.estadisticas_por_estado || {},
          mes_actual: datos.estadisticas_mes_actual || {},
        });
      } else {
        const errorData = await respuesta.json();
        setError(errorData.error || "Error cargando estadísticas");

        setEstadisticas({
          clientes: 0,
          ventas: 0,
          pendientes: 0,
          ingresos: 0,
        });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión. Verificando estado del servidor...");

      setEstadisticas({
        clientes: 0,
        ventas: 0,
        pendientes: 0,
        ingresos: 0,
      });
    } finally {
      setCargando(false);
    }
  };

  const formatearDinero = (cantidad) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(cantidad);
  };

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat("es-MX").format(numero);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Visión Allende
                </h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/clientes"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Clientes
              </Link>
              <Link
                href="/ventas"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Ventas
              </Link>
              <Link
                href="/reportes"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Reportes
              </Link>
              <Link
                href="/periodos"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Períodos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard Principal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vista general del sistema de gestión óptica
          </p>
          {error && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <div className="flex items-center justify-center">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
                <button
                  onClick={cargarEstadisticas}
                  className="ml-3 underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Clientes
                </h3>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {cargando ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div> // ← DIV dentro de DIV ✅
                  ) : (
                    formatearNumero(estadisticas.clientes)
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Registrados</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Ventas
                </h3>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {cargando ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatearNumero(estadisticas.ventas)
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Totales</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Pendientes
                </h3>
                <div className="text-3xl font-bold text-yellow-600 mt-2">
                  {cargando ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatearNumero(estadisticas.pendientes)
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Por cobrar</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Ingresos
                </h3>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {cargando ? (
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-2xl">
                      {formatearDinero(estadisticas.ingresos)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Depositados</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {!cargando && estadisticasDetalladas.mes_actual.ventas > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Estadísticas del Mes
                </h2>
                <p className="text-gray-600">
                  Resumen de actividad del mes actual
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatearNumero(
                    estadisticasDetalladas.mes_actual.ventas || 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Ventas este mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatearDinero(
                    estadisticasDetalladas.mes_actual.monto_vendido || 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Monto vendido</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatearDinero(
                    estadisticasDetalladas.mes_actual.ingresos || 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Ingresos recibidos</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Accesos Rápidos
              </h2>
              <p className="text-gray-600">Funciones principales del sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/clientes/nuevo"
              className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-transparent hover:border-blue-200 rounded-2xl transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Nuevo Cliente
              </h4>
              <p className="text-sm text-gray-600">
                Registrar un cliente nuevo en el sistema
              </p>
            </Link>

            <Link
              href="/clientes"
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-transparent hover:border-green-200 rounded-2xl transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Ver Clientes
              </h4>
              <p className="text-sm text-gray-600">
                Gestionar información de clientes existentes
              </p>
            </Link>

            <Link
              href="/ventas"
              className="group p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-transparent hover:border-purple-200 rounded-2xl transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Gestionar Ventas
              </h4>
              <p className="text-sm text-gray-600">
                Ver y administrar todas las ventas
              </p>
            </Link>

            <Link
              href="/reportes"
              className="group p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-transparent hover:border-amber-200 rounded-2xl transition-all duration-200 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Reportes
              </h4>
              <p className="text-sm text-gray-600">
                Generar reportes para el contador
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
