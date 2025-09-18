"use client";

import { useState, useEffect } from "react";

export default function EstadisticasDepositos({ periodo = "hoy" }) {
  const [estadisticas, setEstadisticas] = useState({
    depositos_hoy: 0,
    monto_efectivo: 0,
    monto_tarjeta: 0,
    monto_transferencia: 0,
    total_depositado: 0,
    ventas_pendientes: 0,
    monto_pendiente: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    setCargando(true);
    try {
      // Por ahora, datos de ejemplo. Después implementaremos la API real
      setTimeout(() => {
        setEstadisticas({
          depositos_hoy: 8,
          monto_efectivo: 3250.0,
          monto_tarjeta: 1800.0,
          monto_transferencia: 950.0,
          total_depositado: 6000.0,
          ventas_pendientes: 15,
          monto_pendiente: 12500.0,
        });
        setCargando(false);
      }, 1000);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      setCargando(false);
    }
  };

  const formatearDinero = (cantidad) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(cantidad);
  };

  const metodosPago = [
    {
      metodo: "efectivo",
      label: "Efectivo",
      monto: estadisticas.monto_efectivo,
      color: "bg-green-100 text-green-800",
      icono: "💵",
    },
    {
      metodo: "tarjeta",
      label: "Tarjeta",
      monto: estadisticas.monto_tarjeta,
      color: "bg-blue-100 text-blue-800",
      icono: "💳",
    },
    {
      metodo: "transferencia",
      label: "Transferencia",
      monto: estadisticas.monto_transferencia,
      color: "bg-purple-100 text-purple-800",
      icono: "🏦",
    },
  ];

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          💰 Control de Depósitos
          <span className="ml-2 text-sm font-normal text-gray-600">
            ({periodo})
          </span>
        </h3>
      </div>

      <div className="p-6">
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.depositos_hoy}
            </div>
            <div className="text-sm text-blue-800">Depósitos Hoy</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatearDinero(estadisticas.total_depositado)}
            </div>
            <div className="text-sm text-green-800">Total Recaudado</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatearDinero(estadisticas.monto_pendiente)}
            </div>
            <div className="text-sm text-red-800">Por Cobrar</div>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Depósitos por Método de Pago
          </h4>

          <div className="space-y-3">
            {metodosPago.map((metodo) => (
              <div
                key={metodo.metodo}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{metodo.icono}</span>
                  <span className="font-medium text-gray-700">
                    {metodo.label}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatearDinero(metodo.monto)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {estadisticas.total_depositado > 0
                      ? (
                          (metodo.monto / estadisticas.total_depositado) *
                          100
                        ).toFixed(1)
                      : 0}
                    % del total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de ventas pendientes */}
        {estadisticas.ventas_pendientes > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm font-medium text-yellow-800">
                  Ventas con saldo pendiente
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-900">
                  {estadisticas.ventas_pendientes} ventas
                </div>
                <div className="text-xs text-yellow-700">
                  {formatearDinero(estadisticas.monto_pendiente)} por cobrar
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
