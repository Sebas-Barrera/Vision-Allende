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
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // Estados posibles de la venta
  const estadosVenta = [
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
    cargarDatosVenta();
  }, [ventaId]);

  const cargarDatosVenta = async () => {
    setCargando(true);
    try {
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
      setError("Error cargando datos de la venta");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearDinero = (cantidad) => {
    if (!cantidad || cantidad === "0") return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(cantidad));
  };

  const obtenerEstadoInfo = (estado) => {
    return estadosVenta.find((e) => e.valor === estado) || estadosVenta[0];
  };

  const cambiarEstado = async (nuevoEstado) => {
    setActualizandoEstado(true);
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
        await cargarDatosVenta();
      } else {
        alert("Error actualizando estado");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarDepositoAgregado = () => {
    // Recargar datos de la venta para actualizar saldos
    cargarDatosVenta();
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/ventas")}
            className="btn btn-primary"
          >
            Volver a Ventas
          </button>
        </div>
      </div>
    );
  }

  const { venta, graduaciones, depositos, estadisticas, otras_ventas } =
    datosVenta;
  const estadoInfo = obtenerEstadoInfo(venta.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar simple */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl">👓</span>
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  Sistema Óptica
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/clientes"
                className="text-gray-600 hover:text-gray-900"
              >
                👥 Clientes
              </Link>
              <Link href="/ventas" className="text-blue-600 font-medium">
                🛒 Ventas
              </Link>
              <Link
                href="/periodos"
                className="text-gray-600 hover:text-gray-900"
              >
                📅 Períodos
              </Link>
              <Link
                href="/reportes"
                className="text-gray-600 hover:text-gray-900"
              >
                📊 Reportes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Venta {venta.numero_venta}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>📅 {formatearFecha(venta.fecha_venta)}</span>
                  {venta.marca_armazon && <span>👓 {venta.marca_armazon}</span>}
                  {venta.laboratorio && <span>🔬 {venta.laboratorio}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${estadoInfo.color}`}
                >
                  {estadoInfo.label}
                </span>

                <select
                  value={venta.estado}
                  onChange={(e) => cambiarEstado(e.target.value)}
                  disabled={actualizandoEstado}
                  className="text-sm border-gray-300 rounded-md"
                >
                  {estadosVenta.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información financiera rápida */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {formatearDinero(venta.costo_total)}
                </div>
                <div className="text-xs text-green-800">Costo Total</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {formatearDinero(venta.total_depositado)}
                </div>
                <div className="text-xs text-blue-800">Total Pagado</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {formatearDinero(venta.saldo_restante)}
                </div>
                <div className="text-xs text-red-800">Saldo Restante</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {estadisticas.porcentaje_pagado.toFixed(1)}%
                </div>
                <div className="text-xs text-purple-800">Completado</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Cliente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Cliente
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <Link
                    href={`/clientes/${venta.cliente_id}`}
                    className="block text-blue-600 hover:text-blue-800 font-medium mt-1"
                  >
                    {venta.cliente_nombre}
                  </Link>
                </div>

                {venta.cliente_expediente && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Expediente:
                    </span>
                    <p className="mt-1">{venta.cliente_expediente}</p>
                  </div>
                )}

                {venta.cliente_email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="mt-1">{venta.cliente_email}</p>
                  </div>
                )}

                {venta.cliente_celular && (
                  <div>
                    <span className="font-medium text-gray-700">Celular:</span>
                    <p className="mt-1">{venta.cliente_celular}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Producto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Producto
              </h3>

              <div className="space-y-3 text-sm">
                {venta.marca_armazon && (
                  <div>
                    <span className="font-medium text-gray-700">Marca:</span>
                    <p className="mt-1">{venta.marca_armazon}</p>
                  </div>
                )}

                {venta.laboratorio && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Laboratorio:
                    </span>
                    <p className="mt-1">{venta.laboratorio}</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="space-y-2">
                    {venta.precio_armazon && (
                      <div className="flex justify-between">
                        <span>Armazón:</span>
                        <span className="font-medium">
                          {formatearDinero(venta.precio_armazon)}
                        </span>
                      </div>
                    )}
                    {venta.precio_micas && (
                      <div className="flex justify-between">
                        <span>Micas:</span>
                        <span className="font-medium">
                          {formatearDinero(venta.precio_micas)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatearDinero(venta.costo_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Fechas importantes */}
                <div className="border-t pt-3">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        Fecha de venta:
                      </span>
                      <p className="text-xs text-gray-600">
                        {formatearFecha(venta.fecha_venta)}
                      </p>
                    </div>

                    {venta.fecha_llegada_laboratorio && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Llegada del laboratorio:
                        </span>
                        <p className="text-xs text-gray-600">
                          {formatearFecha(venta.fecha_llegada_laboratorio)}
                        </p>
                      </div>
                    )}

                    {venta.fecha_entrega_cliente && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Entrega al cliente:
                        </span>
                        <p className="text-xs text-gray-600">
                          {formatearFecha(venta.fecha_entrega_cliente)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {venta.notas && (
                  <div className="border-t pt-3">
                    <span className="font-medium text-gray-700">Notas:</span>
                    <p className="mt-1 text-gray-600">{venta.notas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial de Depósitos */}
          <div className="lg:col-span-2">
            <HistorialDepositos
              ventaId={ventaId}
              mostrarFormulario={true}
              onDepositoAgregado={manejarDepositoAgregado}
            />

            {/* Graduaciones del Cliente */}
            {graduaciones && graduaciones.length > 0 && (
              <div className="bg-white rounded-lg shadow mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Graduaciones del Cliente
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {graduaciones.map((graduacion) => (
                      <div
                        key={graduacion.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              graduacion.tipo === "lejos"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {graduacion.tipo === "lejos" ? "Lejos" : "Cerca"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatearFecha(graduacion.fecha_examen)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">OD:</span>
                            <span className="ml-1 font-mono">
                              {graduacion.od_esfera
                                ? `${graduacion.od_esfera >= 0 ? "+" : ""}${
                                    graduacion.od_esfera
                                  }`
                                : "--"}
                              {graduacion.od_cilindro
                                ? ` ${graduacion.od_cilindro >= 0 ? "+" : ""}${
                                    graduacion.od_cilindro
                                  }`
                                : ""}
                              {graduacion.od_eje
                                ? ` ${graduacion.od_eje}°`
                                : ""}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">OI:</span>
                            <span className="ml-1 font-mono">
                              {graduacion.oi_esfera
                                ? `${graduacion.oi_esfera >= 0 ? "+" : ""}${
                                    graduacion.oi_esfera
                                  }`
                                : "--"}
                              {graduacion.oi_cilindro
                                ? ` ${graduacion.oi_cilindro >= 0 ? "+" : ""}${
                                    graduacion.oi_cilindro
                                  }`
                                : ""}
                              {graduacion.oi_eje
                                ? ` ${graduacion.oi_eje}°`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Otras ventas del cliente */}
            {otras_ventas && otras_ventas.length > 0 && (
              <div className="bg-white rounded-lg shadow mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Otras Ventas del Cliente
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {otras_ventas.map((venta_item) => (
                      <div
                        key={venta_item.id}
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              href={`/ventas/${venta_item.id}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {venta_item.numero_venta}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {formatearDinero(venta_item.costo_total)} •{" "}
                              {venta_item.fecha_venta_formato}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              obtenerEstadoInfo(venta_item.estado).color
                            }`}
                          >
                            {obtenerEstadoInfo(venta_item.estado).label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex justify-between">
          <Link href="/ventas" className="btn btn-secondary">
            ← Volver a Ventas
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/clientes/${venta.cliente_id}`}
              className="btn btn-secondary"
            >
              Ver Cliente
            </Link>

            <Link
              href={`/clientes/${venta.cliente_id}/nueva-venta`}
              className="btn btn-primary"
            >
              Nueva Venta para este Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
