"use client";

import { useState, useEffect } from "react";

export default function GeneradorReportes() {
  const [periodos, setPeriodos] = useState([]);
  const [configuracion, setConfiguracion] = useState({
    tipo_reporte: "general",
    metodo_filtro: "periodo", // periodo, fecha_personalizada
    periodo_id: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [vistaPreviaGenerando, setVistaPreviaGenerando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [error, setError] = useState("");

  // Tipos de reportes disponibles
  const tiposReporte = [
    {
      valor: "general",
      label: "Reporte General",
      descripcion: "Todas las ventas del período seleccionado",
      icono: "📋",
    },
    {
      valor: "efectivo",
      label: "Depósitos en Efectivo",
      descripcion: "Solo depósitos pagados en efectivo",
      icono: "💵",
    },
    {
      valor: "tarjeta",
      label: "Depósitos con Tarjeta",
      descripcion: "Solo depósitos pagados con tarjeta",
      icono: "💳",
    },
    {
      valor: "transferencia",
      label: "Depósitos por Transferencia",
      descripcion: "Solo depósitos por transferencia bancaria",
      icono: "🏦",
    },
    {
      valor: "todos",
      label: "Reporte Completo",
      descripcion:
        "Archivo Excel con todas las hojas (recomendado para contador)",
      icono: "📁",
    },
  ];

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const respuesta = await fetch("/api/periodos", {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setPeriodos(datos.periodos);

        // Seleccionar período activo por defecto
        const periodoActivo = datos.periodo_activo;
        if (periodoActivo) {
          setConfiguracion((prev) => ({
            ...prev,
            periodo_id: periodoActivo.id,
          }));
        }
      }
    } catch (error) {
      console.error("Error cargando períodos:", error);
    }
  };

  const manejarCambio = (campo, valor) => {
    setConfiguracion((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar vista previa cuando cambia la configuración
    setVistaPrevia(null);
    setError("");
  };

  const validarConfiguracion = () => {
    if (
      configuracion.metodo_filtro === "periodo" &&
      !configuracion.periodo_id
    ) {
      setError("Debe seleccionar un período");
      return false;
    }

    if (configuracion.metodo_filtro === "fecha_personalizada") {
      if (!configuracion.fecha_inicio || !configuracion.fecha_fin) {
        setError("Debe especificar fecha de inicio y fin");
        return false;
      }

      if (
        new Date(configuracion.fecha_inicio) > new Date(configuracion.fecha_fin)
      ) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        return false;
      }
    }

    setError("");
    return true;
  };

  const generarVistaPrevia = async () => {
    if (!validarConfiguracion()) {
      return;
    }

    setVistaPreviaGenerando(true);
    try {
      const parametros = {
        tipo: configuracion.tipo_reporte,
        ...(configuracion.metodo_filtro === "periodo" && {
          periodo_id: configuracion.periodo_id,
        }),
        ...(configuracion.metodo_filtro === "fecha_personalizada" && {
          fecha_inicio: configuracion.fecha_inicio,
          fecha_fin: configuracion.fecha_fin,
        }),
      };

      const respuesta = await fetch("/api/reportes/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(parametros),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setVistaPrevia(datos);
        setError("");
      } else {
        const errorData = await respuesta.json();
        setError(errorData.error || "Error generando vista previa");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setVistaPreviaGenerando(false);
    }
  };

  const descargarReporte = async () => {
    if (!validarConfiguracion()) {
      return;
    }

    setDescargando(true);
    try {
      const parametros = new URLSearchParams({
        tipo: configuracion.tipo_reporte,
        ...(configuracion.metodo_filtro === "periodo" && {
          periodo_id: configuracion.periodo_id,
        }),
        ...(configuracion.metodo_filtro === "fecha_personalizada" && {
          fecha_inicio: configuracion.fecha_inicio,
          fecha_fin: configuracion.fecha_fin,
        }),
      });

      const respuesta = await fetch(`/api/reportes/excel?${parametros}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        // Crear blob del archivo Excel
        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);

        // Obtener nombre del archivo desde los headers
        const contentDisposition = respuesta.headers.get("content-disposition");
        let nombreArchivo = "reporte.xlsx";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            nombreArchivo = match[1];
          }
        }

        // Crear enlace de descarga
        const enlaceDescarga = document.createElement("a");
        enlaceDescarga.href = url;
        enlaceDescarga.download = nombreArchivo;
        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();

        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(enlaceDescarga);

        setError("");
      } else {
        const errorData = await respuesta.json();
        setError(errorData.error || "Error descargando reporte");
      }
    } catch (error) {
      setError("Error de conexión al descargar");
    } finally {
      setDescargando(false);
    }
  };

  const formatearDinero = (cantidad) => {
    if (!cantidad) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(cantidad));
  };

  const obtenerTipoReporte = () => {
    return (
      tiposReporte.find((t) => t.valor === configuracion.tipo_reporte) ||
      tiposReporte[0]
    );
  };

  const obtenerPeriodoSeleccionado = () => {
    return periodos.find((p) => p.id === configuracion.periodo_id);
  };

  return (
    <div className="space-y-6">
      {/* Configuración del Reporte */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            📊 Configuración de Reporte
          </h2>
          <p className="text-gray-600 mt-1">
            Selecciona el tipo de reporte y período para generar
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Reporte
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tiposReporte.map((tipo) => (
                <div
                  key={tipo.valor}
                  onClick={() => manejarCambio("tipo_reporte", tipo.valor)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    configuracion.tipo_reporte === tipo.valor
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{tipo.icono}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {tipo.label}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {tipo.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Método de Filtro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtrar por
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="metodo_filtro"
                  value="periodo"
                  checked={configuracion.metodo_filtro === "periodo"}
                  onChange={(e) =>
                    manejarCambio("metodo_filtro", e.target.value)
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">📅 Período Contable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="metodo_filtro"
                  value="fecha_personalizada"
                  checked={
                    configuracion.metodo_filtro === "fecha_personalizada"
                  }
                  onChange={(e) =>
                    manejarCambio("metodo_filtro", e.target.value)
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">🗓️ Fechas Personalizadas</span>
              </label>
            </div>
          </div>

          {/* Selección de Período */}
          {configuracion.metodo_filtro === "periodo" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período Contable
              </label>
              <select
                value={configuracion.periodo_id}
                onChange={(e) => manejarCambio("periodo_id", e.target.value)}
                className="form-input"
              >
                <option value="">Seleccionar período...</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nombre} {periodo.activo && "(Activo)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fechas Personalizadas */}
          {configuracion.metodo_filtro === "fecha_personalizada" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={configuracion.fecha_inicio}
                  onChange={(e) =>
                    manejarCambio("fecha_inicio", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={configuracion.fecha_fin}
                  onChange={(e) => manejarCambio("fecha_fin", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={generarVistaPrevia}
              disabled={vistaPreviaGenerando}
              className={`btn btn-secondary ${
                vistaPreviaGenerando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {vistaPreviaGenerando ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Generando Vista Previa...
                </div>
              ) : (
                "👁️ Vista Previa"
              )}
            </button>

            <button
              onClick={descargarReporte}
              disabled={descargando || vistaPreviaGenerando}
              className={`btn btn-primary ${
                descargando || vistaPreviaGenerando
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {descargando ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Descargando...
                </div>
              ) : (
                "📥 Descargar Excel"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa */}
      {vistaPrevia && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              👁️ Vista Previa del Reporte
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                {obtenerTipoReporte().icono} {obtenerTipoReporte().label}
              </span>
              <span>•</span>
              <span>📅 {vistaPrevia.periodo_nombre}</span>
              <span>•</span>
              <span>
                🕒{" "}
                {new Date(vistaPrevia.fecha_generacion).toLocaleString("es-MX")}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Estadísticas Generales */}
            {vistaPrevia.estadisticas && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Estadísticas del Reporte
                </h3>

                {configuracion.tipo_reporte === "general" &&
                  vistaPrevia.ventas && (
                    <div className="space-y-8">
                      {/* TABLA GENERAL - TODAS LAS VENTAS */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          📋 Reporte General - Todas las Ventas
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-12 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                  Fecha
                                </th>
                                <th className="px-12 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                  Total
                                </th>
                                <th className="px-12 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                  DEPÓSITO
                                </th>
                                <th className="px-12 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                  Saldo Restante
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {vistaPrevia.ventas.map((venta, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-12 py-6 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(
                                      venta.fecha_venta
                                    ).toLocaleDateString("es-MX")}
                                  </td>
                                  <td className="px-12 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${parseFloat(venta.total || 0).toFixed(2)}
                                  </td>
                                  <td className="px-12 py-6 whitespace-nowrap text-sm text-green-600 font-medium">
                                    $
                                    {parseFloat(
                                      venta.total_depositado || 0
                                    ).toFixed(2)}
                                  </td>
                                  <td className="px-12 py-6 whitespace-nowrap text-sm text-red-600 font-medium">
                                    $
                                    {parseFloat(
                                      venta.saldo_restante || 0
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* TABLA EFECTIVO */}
                      {vistaPrevia.ventasEfectivo &&
                        vistaPrevia.ventasEfectivo.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              💵 Ventas en Efectivo
                            </h3>

                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-green-50">
                                  <tr>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-green-900 uppercase tracking-wider">
                                      Fecha
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-green-900 uppercase tracking-wider">
                                      Total
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-green-900 uppercase tracking-wider">
                                      DEPÓSITO
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-green-900 uppercase tracking-wider">
                                      Saldo Restante
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {vistaPrevia.ventasEfectivo.map(
                                    (venta, index) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-green-50"
                                      >
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(
                                            venta.fecha_venta
                                          ).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                          $
                                          {parseFloat(venta.total || 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-green-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.deposito || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-red-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.saldo_restante || 0
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      {/* TABLA TARJETA */}
                      {vistaPrevia.ventasTarjeta &&
                        vistaPrevia.ventasTarjeta.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              💳 Ventas con Tarjeta
                            </h3>

                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-50">
                                  <tr>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                                      Fecha
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                                      Total
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                                      DEPÓSITO
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                                      Saldo Restante
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {vistaPrevia.ventasTarjeta.map(
                                    (venta, index) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-blue-50"
                                      >
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(
                                            venta.fecha_venta
                                          ).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                          $
                                          {parseFloat(venta.total || 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-green-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.deposito || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-red-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.saldo_restante || 0
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      {/* TABLA TRANSFERENCIA */}
                      {vistaPrevia.ventasTransferencia &&
                        vistaPrevia.ventasTransferencia.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              🏦 Ventas por Transferencia
                            </h3>

                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-purple-50">
                                  <tr>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                                      Fecha
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                                      Total
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                                      DEPÓSITO
                                    </th>
                                    <th className="px-12 py-6 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                                      Saldo Restante
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {vistaPrevia.ventasTransferencia.map(
                                    (venta, index) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-purple-50"
                                      >
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(
                                            venta.fecha_venta
                                          ).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                          $
                                          {parseFloat(venta.total || 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-green-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.deposito || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="px-12 py-6 whitespace-nowrap text-sm text-red-600 font-medium">
                                          $
                                          {parseFloat(
                                            venta.saldo_restante || 0
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                {(configuracion.tipo_reporte === "efectivo" ||
                  configuracion.tipo_reporte === "tarjeta" ||
                  configuracion.tipo_reporte === "transferencia") && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {vistaPrevia.estadisticas.total_depositos}
                      </div>
                      <div className="text-xs text-blue-800">
                        Total Depósitos
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatearDinero(
                          vistaPrevia.estadisticas.monto_total_metodo
                        )}
                      </div>
                      <div className="text-xs text-green-800">
                        Monto {vistaPrevia.metodo_pago}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {vistaPrevia.estadisticas.ventas_con_metodo}
                      </div>
                      <div className="text-xs text-purple-800">
                        Ventas con este método
                      </div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {vistaPrevia.estadisticas.porcentaje_del_total.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-xs text-orange-800">Del total</div>
                    </div>
                  </div>
                )}

                {configuracion.tipo_reporte === "todos" &&
                  vistaPrevia.general && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        📋 Resumen General
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {vistaPrevia.general.estadisticas.total_ventas}
                          </div>
                          <div className="text-xs text-blue-800">Ventas</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas.total_vendido
                            )}
                          </div>
                          <div className="text-xs text-green-800">Vendido</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas.total_depositado
                            )}
                          </div>
                          <div className="text-xs text-purple-800">Cobrado</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-xl font-bold text-red-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas.total_pendiente
                            )}
                          </div>
                          <div className="text-xs text-red-800">Pendiente</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas
                                .depositos_por_metodo.efectivo
                            )}
                          </div>
                          <div className="text-xs text-green-800">
                            💵 Efectivo
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas
                                .depositos_por_metodo.tarjeta
                            )}
                          </div>
                          <div className="text-xs text-blue-800">
                            💳 Tarjeta
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {formatearDinero(
                              vistaPrevia.general.estadisticas
                                .depositos_por_metodo.transferencia
                            )}
                          </div>
                          <div className="text-xs text-purple-800">
                            🏦 Transferencia
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Confirmación para descarga */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-xl">✅</div>
                <div>
                  <h4 className="font-medium text-green-800 mb-1">
                    Vista previa generada correctamente
                  </h4>
                  <p className="text-green-700 text-sm mb-3">
                    Los datos están listos para descargar. El archivo Excel
                    contendrá toda la información mostrada arriba.
                  </p>

                  <button
                    onClick={descargarReporte}
                    disabled={descargando}
                    className={`btn btn-primary btn-sm ${
                      descargando ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {descargando ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Descargando...
                      </div>
                    ) : (
                      "📥 Descargar Reporte Excel"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
