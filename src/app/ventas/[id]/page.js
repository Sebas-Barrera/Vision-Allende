"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import HistorialDepositos from "@/components/tablas/HistorialDepositos";

export default function PaginaDetalleVenta() {
  const params = useParams();
  const router = useRouter();
  const ventaId = params.id;

  const [datosVenta, setDatosVenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ventaId) {
      cargarDatosVenta();
    }
  }, [ventaId]);

  const cargarDatosVenta = async () => {
    try {
      setCargando(true);
      const respuesta = await fetch(`/api/ventas/${ventaId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setDatosVenta(datos);
      } else {
        setError("Venta no encontrada");
      }
    } catch (error) {
      console.error("Error cargando venta:", error);
      setError("Error cargando información de la venta");
    } finally {
      setCargando(false);
    }
  };

  // Función para actualizar datos después de agregar un depósito
  const actualizarDatos = () => {
    cargarDatosVenta();
  };

  // Obtener información del estado
  const obtenerEstadoInfo = (estado) => {
    const estados = {
      pendiente: {
        label: "Pendiente",
        color: "bg-yellow-100 text-yellow-800",
        icon: "clock",
      },
      en_laboratorio: {
        label: "En Laboratorio",
        color: "bg-blue-100 text-blue-800",
        icon: "beaker",
      },
      listo: {
        label: "Listo",
        color: "bg-green-100 text-green-800",
        icon: "check",
      },
      entregado: {
        label: "Entregado",
        color: "bg-gray-100 text-gray-800",
        icon: "truck",
      },
      cancelado: {
        label: "Cancelado",
        color: "bg-red-100 text-red-800",
        icon: "x",
      },
    };

    return (
      estados[estado] || {
        label: estado,
        color: "bg-gray-100 text-gray-800",
        icon: "help",
      }
    );
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIconoEstado = (tipo) => {
    const iconos = {
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      beaker: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z"
        />
      ),
      check: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ),
      truck: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      x: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ),
      help: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    };
    return iconos[tipo] || iconos.help;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#095a6d]/30 border-t-[#095a6d] rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando detalles
          </h2>
          <p className="text-gray-600">Obteniendo información de la venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/ventas"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] text-white font-semibold rounded-xl hover:from-[#073d4a] hover:to-[#0a3b50] transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Ventas
          </Link>
        </div>
      </div>
    );
  }

  if (!datosVenta) return null;

  const { venta } = datosVenta;
  const estadoInfo = obtenerEstadoInfo(venta.estado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-xl flex items-center justify-center">
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
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                href="/clientes"
                className="text-gray-600 hover:text-[#095a6d] transition-colors"
              >
                Clientes
              </Link>
              <Link
                href="/ventas"
                className="text-gray-600 hover:text-[#095a6d] transition-colors"
              >
                Ventas
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#095a6d]">
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
          <Link href="/ventas" className="hover:text-[#095a6d]">
            Ventas
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
          <span className="text-gray-900 font-medium">
            #{venta.numero_venta}
          </span>
        </nav>

        {/* Encabezado Principal */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-2xl flex items-center justify-center mr-6">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Venta #{venta.numero_venta}
                </h1>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${estadoInfo.color}`}
                  >
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {getIconoEstado(estadoInfo.icon)}
                    </svg>
                    {estadoInfo.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    Creada el {formatearFecha(venta.fecha_venta)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/clientes/${venta.cliente_id}`}
                className="inline-flex items-center px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Ver Cliente
              </Link>

              <Link
                href={`/clientes/${venta.cliente_id}/nueva-venta`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] hover:from-[#073d4a] hover:to-[#0a3b50] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Nueva Venta
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información del Cliente */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Cliente</h2>
                  <p className="text-gray-600">Información del comprador</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {venta.cliente_nombre}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  {venta.cliente_expediente && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-500"
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
                      <span>
                        <strong>Expediente:</strong> {venta.cliente_expediente}
                      </span>
                    </div>
                  )}
                  {venta.cliente_email && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <span>
                        <strong>Email:</strong> {venta.cliente_email}
                      </span>
                    </div>
                  )}
                  {venta.cliente_celular && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>
                        <strong>Celular:</strong> {venta.cliente_celular}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del Producto */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
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
                  <h2 className="text-2xl font-bold text-gray-900">Producto</h2>
                  <p className="text-gray-600">Detalles del armazón y lentes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {venta.marca_armazon && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Marca del Armazón
                      </h4>
                      <p className="text-gray-700">{venta.marca_armazon}</p>
                    </div>
                  )}
                  {venta.laboratorio && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Laboratorio
                      </h4>
                      <p className="text-gray-700">{venta.laboratorio}</p>
                    </div>
                  )}
                </div>

                {/* Imagen de receta */}
                {venta.imagen_receta && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Receta Médica
                    </h4>
                    <div className="max-w-md">
                      <img
                        src={`/uploads/${venta.imagen_receta}`}
                        alt="Receta médica"
                        className="w-full border rounded-xl shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas Importantes */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
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
                    Cronología
                  </h2>
                  <p className="text-gray-600">
                    Fechas importantes del proceso
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Fecha de Venta
                    </h4>
                    <p className="text-gray-700">
                      {formatearFecha(venta.fecha_venta)}
                    </p>
                  </div>
                </div>

                {venta.fecha_llegada_laboratorio && (
                  <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-4">
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
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Llegada del Laboratorio
                      </h4>
                      <p className="text-gray-700">
                        {formatearFecha(venta.fecha_llegada_laboratorio)}
                      </p>
                    </div>
                  </div>
                )}

                {venta.fecha_entrega_cliente && (
                  <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Entrega al Cliente
                      </h4>
                      <p className="text-gray-700">
                        {formatearFecha(venta.fecha_entrega_cliente)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            {venta.notas && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notas</h2>
                    <p className="text-gray-600">Observaciones adicionales</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <p className="text-gray-700 leading-relaxed">{venta.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-8">
            {/* Resumen Financiero */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Resumen</h3>
                  <p className="text-sm text-gray-600">
                    Información financiera
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {venta.precio_armazon &&
                  parseFloat(venta.precio_armazon) > 0 && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">
                        Armazón
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${parseFloat(venta.precio_armazon).toFixed(2)}
                      </span>
                    </div>
                  )}

                {venta.precio_micas && parseFloat(venta.precio_micas) > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">
                      Micas
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ${parseFloat(venta.precio_micas).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#095a6d]/10 to-blue-50 rounded-xl mb-3">
                    <span className="font-semibold text-gray-900">
                      Costo Total
                    </span>
                    <span className="text-lg font-bold text-[#095a6d]">
                      ${parseFloat(venta.costo_total).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl mb-3">
                    <span className="font-semibold text-gray-900">
                      Total Depositado
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      ${parseFloat(venta.deposito_inicial || 0).toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`flex justify-between items-center p-4 rounded-xl ${
                      parseFloat(venta.saldo_restante) > 0
                        ? "bg-red-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <span className="font-semibold text-gray-900">
                      Saldo Restante
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        parseFloat(venta.saldo_restante) > 0
                          ? "text-red-700"
                          : "text-gray-600"
                      }`}
                    >
                      ${parseFloat(venta.saldo_restante).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Link
                  href={`/clientes/${venta.cliente_id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-xl transition-colors duration-200"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Ver Perfil del Cliente
                </Link>

                <Link
                  href={`/clientes/${venta.cliente_id}/graduacion`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium rounded-xl transition-colors duration-200"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Ver Graduaciones
                </Link>

                <Link
                  href={`/clientes/${venta.cliente_id}/nueva-venta`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] hover:from-[#073d4a] hover:to-[#0a3b50] text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Nueva Venta para Cliente
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Depósitos */}
        <div className="mt-8">
          <HistorialDepositos
            ventaId={ventaId}
            onDepositoAgregado={actualizarDatos}
            mostrarFormulario={parseFloat(venta.saldo_restante) > 0}
          />
        </div>

        {/* Botón de regreso */}
        <div className="mt-8 text-center">
          <Link
            href="/ventas"
            className="inline-flex items-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Ventas
          </Link>
        </div>
      </main>
    </div>
  );
}
