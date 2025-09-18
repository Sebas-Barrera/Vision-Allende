"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaginaClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async (terminoBusqueda = "") => {
    try {
      setCargando(true);

      // Volver a usar la API principal ya corregida
      const url = terminoBusqueda
        ? `/api/clientes?busqueda=${encodeURIComponent(terminoBusqueda)}`
        : "/api/clientes";

      console.log("Cargando desde:", url);

      const respuesta = await fetch(url, {
        credentials: "include",
      });

      console.log("Respuesta status:", respuesta.status);

      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log("Datos recibidos:", datos);
        setClientes(datos.clientes);
        setError("");
      } else {
        const errorData = await respuesta.text();
        console.error("Error response:", errorData);
        setError("Error cargando clientes: " + respuesta.status);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarBusqueda = (evento) => {
    evento.preventDefault();
    cargarClientes(busqueda);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-MX");
  };

  const formatearDinero = (cantidad) => {
    if (!cantidad || cantidad === "0") return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(cantidad));
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const obtenerColorAvatar = (nombre) => {
    const colores = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600", 
      "from-green-500 to-green-600",
      "from-amber-500 to-amber-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-emerald-500 to-emerald-600",
      "from-orange-500 to-orange-600",
    ];
    const indice = nombre ? nombre.length % colores.length : 0;
    return colores[indice];
  };

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
                  <p className="text-sm text-gray-500 font-medium">Gestión de Clientes</p>
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
                className="px-4 py-2 text-[#095a6d] bg-[#095a6d]/10 rounded-lg font-medium"
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Clientes
              </h2>
              <p className="text-gray-600">
                Administra la base de datos de clientes de tu óptica
              </p>
            </div>
            <Link
              href="/clientes/nuevo"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0a4a5c] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Cliente
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <form onSubmit={manejarBusqueda} className="relative max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, expediente o teléfono..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-[#095a6d] text-white rounded-lg hover:bg-[#095a6d]/90 transition-colors duration-200"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Estado de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#095a6d] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Cargando clientes...</p>
              </div>
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {busqueda ? "No se encontraron resultados" : "No hay clientes registrados"}
              </h3>
              <p className="text-gray-600 mb-6">
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza registrando tu primer cliente para gestionar tu base de datos"}
              </p>
              <Link 
                href="/clientes/nuevo" 
                className="inline-flex items-center px-6 py-3 bg-[#095a6d] text-white font-semibold rounded-xl hover:bg-[#095a6d]/90 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Primer Cliente
              </Link>
            </div>
          ) : (
            <>
              {/* Tabla de clientes */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Expediente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Ventas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${obtenerColorAvatar(cliente.nombre_completo)} flex items-center justify-center shadow-sm`}>
                              <span className="text-white font-semibold text-sm">
                                {obtenerIniciales(cliente.nombre_completo)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {cliente.nombre_completo || "Sin nombre"}
                              </div>
                              {cliente.edad && (
                                <div className="text-xs text-gray-500">
                                  {cliente.edad} años
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.expediente || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cliente.celular || cliente.telefono || "Sin teléfono"}
                          </div>
                          {cliente.email && (
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              {cliente.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.total_ventas || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatearDinero(cliente.total_gastado || 0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(cliente.fecha_registro)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/clientes/${cliente.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#095a6d] bg-[#095a6d]/10 rounded-lg hover:bg-[#095a6d]/20 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </Link>
                            <Link
                              href={`/clientes/${cliente.id}/graduacion`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Graduación
                            </Link>
                            <Link
                              href={`/clientes/${cliente.id}/nueva-venta`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5" />
                              </svg>
                              Venta
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Resumen de estadísticas */}
        {clientes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{clientes.length}</p>
                <p className="text-sm font-medium text-gray-600">Clientes Registrados</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  {clientes.reduce((total, cliente) => total + parseInt(cliente.total_ventas || 0), 0)}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">
                  {formatearDinero(
                    clientes.reduce((total, cliente) => total + parseFloat(cliente.total_gastado || 0), 0)
                  )}
                </p>
                <p className="text-sm font-medium text-white/80">Ingresos Totales</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}