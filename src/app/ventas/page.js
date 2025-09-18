"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaginaVentas() {
  const [ventas, setVentas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [error, setError] = useState("");

  // Estados disponibles
  const estadosVenta = [
    {
      valor: "",
      label: "Todos los estados",
      color: "bg-gray-100 text-gray-800",
    },
    {
      valor: "pendiente",
      label: "Pendiente",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      valor: "en_laboratorio",
      label: "En Laboratorio",
      color: "bg-blue-100 text-blue-800",
    },
    { valor: "listo", label: "Listo", color: "bg-green-100 text-green-800" },
    {
      valor: "entregado",
      label: "Entregado",
      color: "bg-gray-100 text-gray-800",
    },
    {
      valor: "cancelado",
      label: "Cancelado",
      color: "bg-red-100 text-red-800",
    },
  ];

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async (terminoBusqueda = "", estado = "") => {
    try {
      setCargando(true);

      let url = "/api/ventas?limite=100";
      if (terminoBusqueda)
        url += `&busqueda=${encodeURIComponent(terminoBusqueda)}`;
      if (estado) url += `&estado=${encodeURIComponent(estado)}`;

      const respuesta = await fetch(url, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setVentas(datos.ventas);
        setEstadisticas(datos.estadisticas);
        setError("");
      } else {
        setError("Error cargando ventas");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const manejarBusqueda = (evento) => {
    evento.preventDefault();
    cargarVentas(busqueda, filtroEstado);
  };

  const manejarFiltroEstado = (estado) => {
    setFiltroEstado(estado);
    cargarVentas(busqueda, estado);
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

  const obtenerEstadoInfo = (estado) => {
    return (
      estadosVenta.find((e) => e.valor === estado) ||
      estadosVenta.find((e) => e.valor === "pendiente")
    );
  };

  const cambiarEstadoRapido = async (ventaId, nuevoEstado) => {
    try {
      const respuesta = await fetch(`/api/ventas/${ventaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (respuesta.ok) {
        // Recargar ventas para reflejar el cambio
        cargarVentas(busqueda, filtroEstado);
      } else {
        alert("Error actualizando estado");
      }
    } catch (error) {
      alert("Error de conexión");
    }
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
                  <p className="text-sm text-gray-500 font-medium">Gestión de Ventas</p>
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
                className="px-4 py-2 text-[#095a6d] bg-[#095a6d]/10 rounded-lg font-medium"
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
                Gestión de Ventas
              </h2>
              <p className="text-gray-600">
                Administra y da seguimiento a todas las ventas de la óptica
              </p>
            </div>
            <Link
              href="/clientes"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0a4a5c] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registrar Primera Venta
            </Link>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="mb-8 space-y-4">
          {/* Barra de búsqueda */}
          <form onSubmit={manejarBusqueda} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por número de venta, cliente, expediente..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#095a6d] text-white rounded-xl hover:bg-[#095a6d]/90 transition-colors duration-200 font-medium"
            >
              Buscar
            </button>
          </form>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-2">
            {estadosVenta.map((estado) => (
              <button
                key={estado.valor}
                onClick={() => manejarFiltroEstado(estado.valor)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filtroEstado === estado.valor
                    ? estado.color + " shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {estado.label}
                {estadisticas && estadisticas[estado.valor] !== undefined && (
                  <span className="ml-2 text-xs">
                    ({estadisticas[estado.valor] || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
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
                <p className="text-gray-600 font-medium">Cargando ventas...</p>
              </div>
            </div>
          ) : ventas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {busqueda || filtroEstado ? "No se encontraron resultados" : "No hay ventas registradas"}
              </h3>
              <p className="text-gray-600 mb-6">
                {busqueda || filtroEstado
                  ? "Intenta con otros términos de búsqueda o filtros"
                  : "Comienza registrando tu primera venta desde el módulo de clientes"}
              </p>
              <Link 
                href="/clientes" 
                className="inline-flex items-center px-6 py-3 bg-[#095a6d] text-white font-semibold rounded-xl hover:bg-[#095a6d]/90 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Primera Venta
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Venta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Financiero
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ventas.map((venta) => {
                    const estadoInfo = obtenerEstadoInfo(venta.estado);
                    return (
                      <tr key={venta.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {venta.numero_venta}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatearFecha(venta.fecha_venta)}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {venta.cliente || "Cliente no especificado"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Exp: {venta.expediente || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {venta.marca_armazon || "Sin especificar"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {venta.laboratorio || "Sin laboratorio"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatearDinero(venta.costo_total)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Pagado: {formatearDinero(venta.total_depositado)}
                            </div>
                            {parseFloat(venta.saldo_restante) > 0 && (
                              <div className="text-xs font-medium text-red-600">
                                Resta: {formatearDinero(venta.saldo_restante)}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${estadoInfo.color}`}>
                              {estadoInfo.label}
                            </span>
                            <select
                              value={venta.estado}
                              onChange={(e) =>
                                cambiarEstadoRapido(venta.id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#095a6d] focus:border-[#095a6d]"
                            >
                              {estadosVenta.slice(1).map((estado) => (
                                <option key={estado.valor} value={estado.valor}>
                                  {estado.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <Link
                              href={`/ventas/${venta.id}`}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#095a6d] bg-[#095a6d]/10 rounded-lg hover:bg-[#095a6d]/20 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Ver Detalle
                            </Link>
                            <Link
                              href={`/clientes/${venta.cliente_id}`}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Ver Cliente
                            </Link>
                            {parseFloat(venta.saldo_restante) > 0 && (
                              <Link
                                href={`/ventas/${venta.id}`}
                                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                                title="Agregar depósito"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Abonar
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen */}
        {ventas.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Mostrando {ventas.length} ventas
              {(busqueda || filtroEstado) && " (filtradas)"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}