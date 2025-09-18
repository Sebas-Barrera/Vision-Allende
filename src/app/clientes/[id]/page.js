"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaginaDetalleCliente() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params.id;

  const [datosCliente, setDatosCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatosCliente();
  }, [clienteId]);

  const cargarDatosCliente = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setDatosCliente(datos);
        setError("");
      } else {
        setError("Cliente no encontrado");
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
      setError("Error cargando información del cliente");
    } finally {
      setCargando(false);
    }
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

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#095a6d] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Cargando información del cliente...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/clientes")}
            className="inline-flex items-center px-4 py-2 bg-[#095a6d] text-white font-medium rounded-xl hover:bg-[#095a6d]/90 transition-colors duration-200"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  const { cliente, graduaciones, ventas, estadisticas } = datosCliente;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Título */}
            <div className="flex items-center space-x-4">
              <Link href="/clientes" className="flex items-center space-x-4">
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
                    Detalle de Cliente
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
                className="px-4 py-2 text-[#095a6d] bg-[#095a6d]/10 rounded-lg font-medium"
              >
                Clientes
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
            <Link
              href="/clientes"
              className="hover:text-[#095a6d] transition-colors"
            >
              Clientes
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
              {cliente.nombre_completo}
            </span>
          </nav>
        </div>

        {/* Encabezado del cliente */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm mb-8">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#095a6d] to-[#0a4a5c] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {cliente.nombre_completo?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {cliente.nombre_completo}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    {cliente.expediente && (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Exp: {cliente.expediente}
                      </span>
                    )}
                    {cliente.edad && (
                      <span className="inline-flex items-center px-3 py-1 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        {cliente.edad} años
                      </span>
                    )}
                    {cliente.ocupacion && (
                      <span className="inline-flex items-center px-3 py-1 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM5 20v-5a2 2 0 012-2h10a2 2 0 012 2v5a1 1 0 01-1 1H6a1 1 0 01-1-1z"
                          />
                        </svg>
                        {cliente.ocupacion}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-1"
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
                      Registrado: {formatearFecha(cliente.fecha_creacion)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/clientes/${clienteId}/graduacion`}
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Graduaciones
                </Link>
                <Link
                  href={`/clientes/${clienteId}/nueva-venta`}
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5"
                    />
                  </svg>
                  Nueva Venta
                </Link>
                <button
                  onClick={() => router.push(`/clientes/${clienteId}/editar`)}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar
                </button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas?.total_ventas || 0}
                </div>
                <div className="text-sm text-blue-600">Ventas Totales</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {formatearDinero(estadisticas?.total_gastado)}
                </div>
                <div className="text-sm text-green-600">Total Gastado</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">
                  {formatearDinero(estadisticas?.saldo_pendiente)}
                </div>
                <div className="text-sm text-amber-600">Saldo Pendiente</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {estadisticas?.graduaciones_registradas || 0}
                </div>
                <div className="text-sm text-purple-600">Graduaciones</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contacto */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Información de Contacto
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email:
                  </span>
                  <p className="text-gray-900">
                    {cliente.email || "No registrado"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Celular:
                  </span>
                  <p className="text-gray-900">
                    {cliente.celular || "No registrado"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Teléfono:
                  </span>
                  <p className="text-gray-900">
                    {cliente.telefono || "No registrado"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Dirección:
                  </span>
                  <p className="text-gray-900">
                    {cliente.direccion || "No registrada"}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Médica
                </h3>
              </div>
              <div className="space-y-3">
                {cliente.peso && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Peso:
                    </span>
                    <p className="text-gray-900">{cliente.peso} kg</p>
                  </div>
                )}
                {cliente.talla && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Talla:
                    </span>
                    <p className="text-gray-900">{cliente.talla} m</p>
                  </div>
                )}
                {cliente.imc && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      IMC:
                    </span>
                    <p className="text-gray-900">{cliente.imc}</p>
                  </div>
                )}
                {cliente.presion_arterial && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Presión Arterial:
                    </span>
                    <p className="text-gray-900">{cliente.presion_arterial}</p>
                  </div>
                )}
                {cliente.motivo_consulta && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Motivo de Consulta:
                    </span>
                    <p className="text-gray-900">{cliente.motivo_consulta}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Antecedentes */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
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
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Antecedentes Médicos
                </h3>
              </div>
              <div className="space-y-2">
                {cliente.presion_alta && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-900">Presión Arterial Alta</span>
                  </div>
                )}
                {cliente.diabetes && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-900">Diabetes</span>
                  </div>
                )}
                {cliente.alergias && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Alergias:
                    </span>
                    <p className="text-gray-900 mt-1">{cliente.alergias}</p>
                  </div>
                )}
                {cliente.antecedentes_notas && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Notas adicionales:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {cliente.antecedentes_notas}
                    </p>
                  </div>
                )}
                {!cliente.presion_alta &&
                  !cliente.diabetes &&
                  !cliente.alergias &&
                  !cliente.antecedentes_notas && (
                    <p className="text-gray-500">
                      No hay antecedentes registrados
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Graduaciones y Ventas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graduaciones */}
            {graduaciones && graduaciones.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Graduaciones
                    </h3>
                  </div>
                  <Link
                    href={`/clientes/${clienteId}/graduacion`}
                    className="text-[#095a6d] hover:text-[#095a6d]/80 font-medium text-sm"
                  >
                    Gestionar →
                  </Link>
                </div>
                <div className="space-y-4">
                  {graduaciones.map((graduacion) => (
                    <div
                      key={graduacion.id}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            graduacion.tipo === "lejos"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {graduacion.tipo === "lejos"
                            ? "Visión de Lejos"
                            : "Visión de Cerca"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatearFecha(graduacion.fecha_examen)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700 mb-1">
                            Ojo Derecho (OD)
                          </div>
                          <div className="space-y-1">
                            <div>Esfera: {graduacion.od_esfera || "N/A"}</div>
                            <div>
                              Cilindro: {graduacion.od_cilindro || "N/A"}
                            </div>
                            <div>Eje: {graduacion.od_eje || "N/A"}</div>
                            {graduacion.od_adicion && (
                              <div>Adición: {graduacion.od_adicion}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 mb-1">
                            Ojo Izquierdo (OI)
                          </div>
                          <div className="space-y-1">
                            <div>Esfera: {graduacion.oi_esfera || "N/A"}</div>
                            <div>
                              Cilindro: {graduacion.oi_cilindro || "N/A"}
                            </div>
                            <div>Eje: {graduacion.oi_eje || "N/A"}</div>
                            {graduacion.oi_adicion && (
                              <div>Adición: {graduacion.oi_adicion}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {graduacion.notas && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="font-medium text-gray-700">
                            Notas:
                          </span>
                          <p className="text-gray-600 mt-1">
                            {graduacion.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de Ventas */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18M9.5 18h7.5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Historial de Ventas ({ventas?.length || 0})
                  </h3>
                </div>
                <Link
                  href={`/clientes/${clienteId}/nueva-venta`}
                  className="text-[#095a6d] hover:text-[#095a6d]/80 font-medium text-sm"
                >
                  Nueva Venta →
                </Link>
              </div>

              {ventas && ventas.length > 0 ? (
                <div className="space-y-4">
                  {ventas.map((venta) => (
                    <div
                      key={venta.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {venta.numero_venta}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatearFecha(venta.fecha_venta)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatearDinero(venta.costo_total)}
                          </div>
                          {parseFloat(venta.saldo_restante) > 0 && (
                            <div className="text-sm text-red-600">
                              Resta: {formatearDinero(venta.saldo_restante)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>Marca: {venta.marca_armazon || "N/A"}</div>
                        <div>Laboratorio: {venta.laboratorio || "N/A"}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            venta.estado === "entregado"
                              ? "bg-green-100 text-green-800"
                              : venta.estado === "listo"
                              ? "bg-blue-100 text-blue-800"
                              : venta.estado === "en_laboratorio"
                              ? "bg-yellow-100 text-yellow-800"
                              : venta.estado === "pendiente"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {venta.estado === "entregado"
                            ? "Entregado"
                            : venta.estado === "listo"
                            ? "Listo"
                            : venta.estado === "en_laboratorio"
                            ? "En Laboratorio"
                            : venta.estado === "pendiente"
                            ? "Pendiente"
                            : "Cancelado"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/ventas/${venta.id}`}
                            className="text-[#095a6d] hover:text-[#095a6d]/80 text-xs font-medium"
                          >
                            Ver Detalle
                          </Link>
                          {parseFloat(venta.saldo_restante) > 0 && (
                            <Link
                              href={`/ventas/${venta.id}`}
                              className="text-green-600 hover:text-green-800 text-xs font-medium"
                              title="Agregar depósito"
                            >
                              Abonar
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <p className="text-gray-500 mb-4">
                    No hay ventas registradas
                  </p>
                  <Link
                    href={`/clientes/${clienteId}/nueva-venta`}
                    className="inline-flex items-center px-4 py-2 bg-[#095a6d] text-white font-medium rounded-xl hover:bg-[#095a6d]/90 transition-colors duration-200"
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
                    Crear Primera Venta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="mt-8 text-center">
          <Link
            href="/clientes"
            className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Clientes
          </Link>
        </div>
      </main>
    </div>
  );
}
