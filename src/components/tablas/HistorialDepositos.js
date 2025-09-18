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
      color: "bg-green-100 text-green-800",
      icono: "💵",
    },
    {
      valor: "tarjeta",
      label: "Tarjeta",
      color: "bg-blue-100 text-blue-800",
      icono: "💳",
    },
    {
      valor: "transferencia",
      label: "Transferencia",
      color: "bg-purple-100 text-purple-800",
      icono: "🏦",
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando historial de depósitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Encabezado con estadísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Depósitos ({depositos.length})
            </h3>
            <p className="text-sm text-gray-600">
              Control de abonos y pagos parciales
            </p>
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
              className="btn btn-primary btn-sm"
            >
              💰 Agregar Depósito
            </button>
          )}
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {estadisticas.total_depositos}
              </div>
              <div className="text-xs text-blue-800">Depósitos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {formatearDinero(estadisticas.total_depositado)}
              </div>
              <div className="text-xs text-green-800">Total Pagado</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {formatearDinero(estadisticas.saldo_restante)}
              </div>
              <div className="text-xs text-red-800">Saldo Restante</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {estadisticas.porcentaje_pagado.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-800">Completado</div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Formulario de nuevo depósito */}
      {mostrarFormNuevo && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {depositoEditando ? "Editar Depósito" : "Agregar Nuevo Depósito"}
          </h4>

          <form onSubmit={manejarSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="monto"
                  value={formDeposito.monto}
                  onChange={manejarCambio}
                  className={`form-input ${
                    errores.monto ? "border-red-300" : ""
                  }`}
                  placeholder="0.00"
                  required
                />
                {errores.monto && (
                  <p className="text-red-600 text-xs mt-1">{errores.monto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  name="metodo_pago"
                  value={formDeposito.metodo_pago}
                  onChange={manejarCambio}
                  className="form-input"
                  required
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.valor} value={metodo.valor}>
                      {metodo.icono} {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Depósito *
                </label>
                <input
                  type="date"
                  name="fecha_deposito"
                  value={formDeposito.fecha_deposito}
                  onChange={manejarCambio}
                  className={`form-input ${
                    errores.fecha_deposito ? "border-red-300" : ""
                  }`}
                  required
                />
                {errores.fecha_deposito && (
                  <p className="text-red-600 text-xs mt-1">
                    {errores.fecha_deposito}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (Opcional)
                </label>
                <input
                  type="text"
                  name="notas"
                  value={formDeposito.notas}
                  onChange={manejarCambio}
                  className="form-input"
                  placeholder="Observaciones del depósito..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormNuevo(false);
                  setDepositoEditando(null);
                }}
                className="btn btn-secondary btn-sm"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className={`btn btn-primary btn-sm ${
                  guardando ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {guardando ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    {depositoEditando ? "Actualizando..." : "Guardando..."}
                  </div>
                ) : depositoEditando ? (
                  "Actualizar Depósito"
                ) : (
                  "Guardar Depósito"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de depósitos */}
      <div className="p-6">
        {depositos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p>No hay depósitos registrados</p>
            {mostrarFormulario && (
              <button
                onClick={() => setMostrarFormNuevo(true)}
                className="btn btn-primary btn-sm mt-2"
              >
                Agregar Primer Depósito
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {depositos.map((deposito) => {
              const metodoPago = obtenerMetodoPago(deposito.metodo_pago);
              return (
                <div
                  key={deposito.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-600">
                          {formatearDinero(deposito.monto)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${metodoPago.color}`}
                        >
                          {metodoPago.icono} {metodoPago.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Fecha:</span>{" "}
                          {deposito.fecha_deposito_formato}
                        </div>
                        <div>
                          <span className="font-medium">Registrado:</span>{" "}
                          {deposito.fecha_registro_formato}
                        </div>
                      </div>

                      {deposito.notas && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">
                            Notas:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {deposito.notas}
                          </p>
                        </div>
                      )}
                    </div>

                    {mostrarFormulario && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => iniciarEdicion(deposito)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Editar depósito"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarDeposito(deposito.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Eliminar depósito"
                        >
                          🗑️
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
