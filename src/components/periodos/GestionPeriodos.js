"use client";

import { useState, useEffect } from "react";

export default function GestionPeriodos() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [cargandoCierre, setCargandoCierre] = useState(false);
  const [estadisticasPeriodo, setEstadisticasPeriodo] = useState(null);

  useEffect(() => {
    cargarPeriodos();
    cargarEstadisticasPeriodoActivo();
  }, []);

  const cargarPeriodos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/periodos", {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setPeriodos(datos.periodos);
        setPeriodoActivo(datos.periodo_activo);
        setError("");
      } else {
        setError("Error cargando períodos");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticasPeriodoActivo = async () => {
    if (!periodoActivo?.id) return;

    try {
      // Obtener estadísticas del período activo
      const respuesta = await fetch(`/api/ventas?limite=1000`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();

        // Filtrar ventas del período activo y calcular estadísticas
        const ventasPeriodo = datos.ventas.filter(
          (v) => v.periodo_id === periodoActivo.id
        );

        const stats = {
          total_ventas: ventasPeriodo.length,
          ventas_pendientes: ventasPeriodo.filter(
            (v) => parseFloat(v.saldo_restante) > 0
          ).length,
          monto_total_vendido: ventasPeriodo.reduce(
            (sum, v) => sum + parseFloat(v.costo_total || 0),
            0
          ),
          monto_total_depositado: ventasPeriodo.reduce(
            (sum, v) => sum + parseFloat(v.total_depositado || 0),
            0
          ),
          monto_pendiente_cobro: ventasPeriodo.reduce(
            (sum, v) => sum + parseFloat(v.saldo_restante || 0),
            0
          ),
          ventas_por_estado: {
            pendiente: ventasPeriodo.filter((v) => v.estado === "pendiente")
              .length,
            en_laboratorio: ventasPeriodo.filter(
              (v) => v.estado === "en_laboratorio"
            ).length,
            listo: ventasPeriodo.filter((v) => v.estado === "listo").length,
            entregado: ventasPeriodo.filter((v) => v.estado === "entregado")
              .length,
            cancelado: ventasPeriodo.filter((v) => v.estado === "cancelado")
              .length,
          },
        };

        setEstadisticasPeriodo(stats);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const cargarVentasPendientes = async () => {
    if (!periodoActivo?.id) return;

    try {
      const respuesta = await fetch(`/api/ventas?limite=1000`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();

        // Filtrar ventas del período activo con saldo pendiente
        const pendientes = datos.ventas.filter(
          (v) =>
            v.periodo_id === periodoActivo.id &&
            parseFloat(v.saldo_restante) > 0 &&
            v.estado !== "cancelado"
        );

        setVentasPendientes(pendientes);
      }
    } catch (error) {
      console.error("Error cargando ventas pendientes:", error);
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
    if (!cantidad) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(cantidad));
  };

  const obtenerEstadoPeriodo = (periodo) => {
    if (periodo.activo) {
      return { label: "Activo", color: "bg-green-100 text-green-800" };
    }
    return { label: "Cerrado", color: "bg-gray-100 text-gray-800" };
  };

  const iniciarCierrePeriodo = async () => {
    await cargarVentasPendientes();
    setMostrarModalCierre(true);
  };

  const confirmarCierrePeriodo = async () => {
    setCargandoCierre(true);
    try {
      const respuesta = await fetch("/api/periodos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          confirmar_cierre: true,
        }),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();

        // Mostrar resumen del cierre
        alert(
          `✅ Período cerrado exitosamente!\n\n` +
            `Período anterior: ${datos.periodo_anterior.nombre}\n` +
            `Nuevo período: ${datos.periodo_nuevo.nombre}\n` +
            `Ventas migradas: ${datos.ventas_migradas.length}\n` +
            `Monto migrado: ${formatearDinero(datos.total_migrado)}`
        );

        // Recargar datos
        await cargarPeriodos();
        setMostrarModalCierre(false);
      } else {
        const errorData = await respuesta.json();
        setError(errorData.error || "Error cerrando período");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setCargandoCierre(false);
    }
  };

  const puedeSerCerrado = () => {
    const hoy = new Date();
    const dia = hoy.getDate();
    // Permitir cierre solo del día 5 al 10 de cada mes (rango flexible)
    return dia >= 5 && dia <= 10;
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando información de períodos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Período Activo */}
      {periodoActivo && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  📅 Período Activo
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {periodoActivo.nombre}
                  </span>
                </h2>
                <p className="text-gray-600 mt-1">
                  {formatearFecha(periodoActivo.fecha_inicio)} -{" "}
                  {formatearFecha(periodoActivo.fecha_fin)}
                </p>
              </div>

              <div className="flex gap-2">
                {puedeSerCerrado() ? (
                  <button
                    onClick={iniciarCierrePeriodo}
                    className="btn btn-primary"
                    disabled={cargandoCierre}
                  >
                    🔒 Cerrar Período
                  </button>
                ) : (
                  <div className="text-right">
                    <button
                      className="btn btn-secondary opacity-50 cursor-not-allowed"
                      disabled
                      title="Solo se puede cerrar del día 5 al 10 de cada mes"
                    >
                      🔒 Cerrar Período
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Cierre disponible del 5-10 del mes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas del período activo */}
          {estadisticasPeriodo && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas del Período
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {estadisticasPeriodo.total_ventas}
                  </div>
                  <div className="text-xs text-blue-800">Total Ventas</div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatearDinero(estadisticasPeriodo.monto_total_vendido)}
                  </div>
                  <div className="text-xs text-green-800">Monto Vendido</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatearDinero(
                      estadisticasPeriodo.monto_total_depositado
                    )}
                  </div>
                  <div className="text-xs text-purple-800">Total Cobrado</div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {formatearDinero(estadisticasPeriodo.monto_pendiente_cobro)}
                  </div>
                  <div className="text-xs text-red-800">Por Cobrar</div>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {estadisticasPeriodo.ventas_pendientes}
                  </div>
                  <div className="text-xs text-yellow-800">Pendientes</div>
                </div>
              </div>

              {/* Estados de ventas */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Distribución por Estado
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="flex justify-between p-2 bg-yellow-50 rounded text-sm">
                    <span>Pendiente:</span>
                    <span className="font-medium">
                      {estadisticasPeriodo.ventas_por_estado.pendiente}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-blue-50 rounded text-sm">
                    <span>En Lab:</span>
                    <span className="font-medium">
                      {estadisticasPeriodo.ventas_por_estado.en_laboratorio}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded text-sm">
                    <span>Listo:</span>
                    <span className="font-medium">
                      {estadisticasPeriodo.ventas_por_estado.listo}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>Entregado:</span>
                    <span className="font-medium">
                      {estadisticasPeriodo.ventas_por_estado.entregado}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded text-sm">
                    <span>Cancelado:</span>
                    <span className="font-medium">
                      {estadisticasPeriodo.ventas_por_estado.cancelado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial de Períodos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            📊 Historial de Períodos
          </h2>
          <p className="text-gray-600 mt-1">
            Todos los períodos contables registrados
          </p>
        </div>

        <div className="p-6">
          {periodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No hay períodos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periodos.map((periodo) => {
                const estado = obtenerEstadoPeriodo(periodo);
                return (
                  <div
                    key={periodo.id}
                    className={`border rounded-lg p-4 ${
                      periodo.activo
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {periodo.nombre}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${estado.color}`}
                          >
                            {estado.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>
                            📅 {formatearFecha(periodo.fecha_inicio)} -{" "}
                            {formatearFecha(periodo.fecha_fin)}
                          </p>
                          <p>🕒 Creado: {periodo.fecha_creacion_formato}</p>
                        </div>
                      </div>

                      {!periodo.activo && (
                        <div className="text-right text-sm text-gray-500">
                          <p>Período cerrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Cierre */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                🔒 Confirmar Cierre de Período
              </h3>
              <p className="text-gray-600 mt-1">
                Esta acción cerrará el período actual y creará uno nuevo
              </p>
            </div>

            <div className="p-6">
              {ventasPendientes.length > 0 ? (
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      ⚠️ Ventas que se migrarán al nuevo período
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      Las siguientes {ventasPendientes.length} ventas tienen
                      saldo pendiente y se migrarán al nuevo período:
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {ventasPendientes.map((venta) => (
                      <div
                        key={venta.id}
                        className="border rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{venta.numero_venta}</p>
                            <p className="text-sm text-gray-600">
                              {venta.cliente_nombre}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">
                              {formatearDinero(venta.saldo_restante)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Saldo pendiente
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      📋 Resumen de Migración
                    </h4>
                    <div className="text-blue-700 text-sm space-y-1">
                      <p>
                        • Se crearán {ventasPendientes.length} nuevas ventas en
                        el nuevo período
                      </p>
                      <p>
                        • El saldo pendiente se convertirá en el nuevo costo
                        total
                      </p>
                      <p>• Los depósitos se resetearán a $0.00</p>
                      <p>
                        • Monto total a migrar:{" "}
                        <span className="font-medium">
                          {formatearDinero(
                            ventasPendientes.reduce(
                              (sum, v) => sum + parseFloat(v.saldo_restante),
                              0
                            )
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    ✅ No hay ventas pendientes
                  </h4>
                  <p className="text-green-700 text-sm">
                    Todas las ventas del período actual están completamente
                    pagadas. Se creará un nuevo período sin migrar ventas.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalCierre(false)}
                className="btn btn-secondary"
                disabled={cargandoCierre}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCierrePeriodo}
                className={`btn btn-primary ${
                  cargandoCierre ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={cargandoCierre}
              >
                {cargandoCierre ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Cerrando Período...
                  </div>
                ) : (
                  "🔒 Confirmar Cierre"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
