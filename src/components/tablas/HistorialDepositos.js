"use client";

import { useState, useEffect } from "react";

export default function HistorialDepositos({
  ventaId,
  mostrarFormulario = true,
  onDepositoAgregado = null,
}) {
  const [depositos, setDepositos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [depositoEditando, setDepositoEditando] = useState(null);

  // Estado del formulario
  const [formDeposito, setFormDeposito] = useState({
    monto: "",
    metodo_pago: "efectivo",
    fecha_deposito: new Date().toISOString().split("T")[0],
    notas: "",
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Métodos de pago disponibles
  const metodosPago = [
    {
      valor: "efectivo",
      label: "Efectivo",
      color: "bg-green-100 text-green-800 border-green-200",
      gradiente: "from-green-50 to-emerald-50",
      icono: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      valor: "tarjeta",
      label: "Tarjeta",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      gradiente: "from-blue-50 to-indigo-50",
      icono: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      valor: "transferencia",
      label: "Transferencia",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      gradiente: "from-purple-50 to-violet-50",
      icono: (
        <svg
          className="w-5 h-5"
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
      ),
    },
  ];

  useEffect(() => {
    if (ventaId) {
      cargarDepositos();
    }
  }, [ventaId]);

  const cargarDepositos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/depositos?venta_id=${ventaId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setDepositos(datos.depositos);
        setEstadisticas(datos.estadisticas);
        setError("");
      } else {
        setError("Error cargando depósitos");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const formatearDinero = (cantidad) => {
    if (!cantidad) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(cantidad));
  };

  const obtenerMetodoPago = (metodo) => {
    return metodosPago.find((m) => m.valor === metodo) || metodosPago[0];
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormDeposito((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formDeposito.monto || parseFloat(formDeposito.monto) <= 0) {
      nuevosErrores.monto = "Monto debe ser mayor a 0";
    }

    if (
      estadisticas &&
      parseFloat(formDeposito.monto) > estadisticas.saldo_restante
    ) {
      nuevosErrores.monto = `No puede exceder el saldo restante: ${formatearDinero(
        estadisticas.saldo_restante
      )}`;
    }

    if (!formDeposito.fecha_deposito) {
      nuevosErrores.fecha_deposito = "Fecha es requerida";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const url = depositoEditando ? `/api/depositos` : `/api/depositos`;
      const metodo = depositoEditando ? "PUT" : "POST";

      const datosEnviar = {
        ...formDeposito,
        venta_id: ventaId,
        ...(depositoEditando && { id: depositoEditando.id }),
      };

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(datosEnviar),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();

        // Recargar depósitos
        await cargarDepositos();

        // Limpiar formulario
        setFormDeposito({
          monto: "",
          metodo_pago: "efectivo",
          fecha_deposito: new Date().toISOString().split("T")[0],
          notas: "",
        });

        setMostrarFormNuevo(false);
        setDepositoEditando(null);

        // Notificar al componente padre
        if (onDepositoAgregado) {
          onDepositoAgregado(datos);
        }
      } else {
        const errorData = await respuesta.json();
        setError(errorData.error || "Error guardando depósito");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (deposito) => {
    setDepositoEditando(deposito);
    setFormDeposito({
      monto: deposito.monto.toString(),
      metodo_pago: deposito.metodo_pago,
      fecha_deposito: deposito.fecha_deposito,
      notas: deposito.notas || "",
    });
    setMostrarFormNuevo(true);
  };

  const eliminarDeposito = async (depositoId) => {
    if (!confirm("¿Está seguro de eliminar este depósito?")) {
      return;
    }

    try {
      const respuesta = await fetch(`/api/depositos?id=${depositoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (respuesta.ok) {
        await cargarDepositos();
        if (onDepositoAgregado) {
          onDepositoAgregado({ tipo: "eliminacion" });
        }
      } else {
        setError("Error eliminando depósito");
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };

  if (cargando) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#095a6d]/30 border-t-[#095a6d] rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando depósitos
          </h3>
          <p className="text-gray-600">Obteniendo historial de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg">
      {/* Encabezado con estadísticas */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
          <div className="flex items-center mb-6 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-xl flex items-center justify-center mr-4">
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Historial de Depósitos ({depositos.length})
              </h3>
              <p className="text-gray-600">
                Control de abonos y pagos parciales
              </p>
            </div>
          </div>

          {mostrarFormulario && (
            <button
              onClick={() => {
                setMostrarFormNuevo(true);
                setDepositoEditando(null);
                setFormDeposito({
                  monto: "",
                  metodo_pago: "efectivo",
                  fecha_deposito: new Date().toISOString().split("T")[0],
                  notas: "",
                });
              }}
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
              Agregar Depósito
            </button>
          )}
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {estadisticas.total_depositos}
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    Depósitos
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {formatearDinero(estadisticas.total_depositado)}
                  </div>
                  <div className="text-sm font-medium text-green-800">
                    Total Pagado
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {formatearDinero(estadisticas.saldo_restante)}
                  </div>
                  <div className="text-sm font-medium text-red-800">
                    Saldo Restante
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mr-3">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {estadisticas.porcentaje_pagado.toFixed(1)}%
                  </div>
                  <div className="text-sm font-medium text-purple-800">
                    Completado
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
          <div className="flex items-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Formulario de nuevo depósito */}
      {mostrarFormNuevo && (
        <div className="p-8 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-3">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              {depositoEditando ? "Editar Depósito" : "Agregar Nuevo Depósito"}
            </h4>
          </div>

          <form onSubmit={manejarSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="monto"
                    value={formDeposito.monto}
                    onChange={manejarCambio}
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 ${
                      errores.monto
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {errores.monto && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errores.monto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <div className="relative">
                  <select
                    name="metodo_pago"
                    value={formDeposito.metodo_pago}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                    required
                  >
                    {metodosPago.map((metodo) => (
                      <option key={metodo.valor} value={metodo.valor}>
                        {metodo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha del Depósito *
                </label>
                <input
                  type="date"
                  name="fecha_deposito"
                  value={formDeposito.fecha_deposito}
                  onChange={manejarCambio}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 ${
                    errores.fecha_deposito
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  required
                />
                {errores.fecha_deposito && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errores.fecha_deposito}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <input
                  type="text"
                  name="notas"
                  value={formDeposito.notas}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="Observaciones del depósito..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormNuevo(false);
                  setDepositoEditando(null);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                disabled={guardando}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] hover:from-[#073d4a] hover:to-[#0a3b50] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  guardando ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {guardando ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {depositoEditando ? "Actualizando..." : "Guardando..."}
                  </div>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {depositoEditando
                      ? "Actualizar Depósito"
                      : "Guardar Depósito"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de depósitos */}
      <div className="p-8">
        {depositos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sin depósitos registrados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              No hay depósitos registrados para esta venta. Comience agregando
              el primer abono.
            </p>
            {mostrarFormulario && (
              <button
                onClick={() => setMostrarFormNuevo(true)}
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
                Agregar Primer Depósito
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {depositos.map((deposito) => {
              const metodoPago = obtenerMetodoPago(deposito.metodo_pago);
              return (
                <div
                  key={deposito.id}
                  className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:bg-white/70 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl font-bold text-[#095a6d]">
                          {formatearDinero(deposito.monto)}
                        </div>
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-xl border ${metodoPago.color}`}
                        >
                          <div className="mr-2">{metodoPago.icono}</div>
                          <span className="font-semibold text-sm">
                            {metodoPago.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            <strong>Fecha:</strong>{" "}
                            {deposito.fecha_deposito_formato}
                          </span>
                        </div>
                        <div className="flex items-center">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            <strong>Registrado:</strong>{" "}
                            {deposito.fecha_registro_formato}
                          </span>
                        </div>
                      </div>

                      {deposito.notas && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                          <div className="flex items-start">
                            <svg
                              className="w-4 h-4 mr-2 mt-0.5 text-gray-500"
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
                            <div>
                              <span className="text-sm font-semibold text-gray-700">
                                Notas:
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {deposito.notas}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {mostrarFormulario && (
                      <div className="flex gap-3 mt-4 lg:mt-0 lg:ml-6">
                        <button
                          onClick={() => iniciarEdicion(deposito)}
                          className="inline-flex items-center px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-xl transition-colors duration-200"
                          title="Editar depósito"
                        >
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarDeposito(deposito.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-xl transition-colors duration-200"
                          title="Eliminar depósito"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Eliminar
                        </button>
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
  );
}
