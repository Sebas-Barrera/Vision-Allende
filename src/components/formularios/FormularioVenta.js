"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parsearDinero, sumarDinero, restarDinero } from "@/lib/dinero-utils";
import Link from "next/link";

export default function FormularioVenta({
  clienteId = null,
  ventaExistente = null,
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cliente, setCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [archivoReceta, setArchivoReceta] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Estado del formulario de venta
  const [datosVenta, setDatosVenta] = useState({
    cliente_id: clienteId || "",
    marca_armazon: "",
    laboratorio: "",
    precio_armazon: "",
    precio_micas: "",
    costo_total: "",
    deposito_inicial: "",
    saldo_restante: "",
    estado: "pendiente",
    fecha_venta: new Date().toISOString().split("T")[0],
    fecha_llegada_laboratorio: "",
    fecha_entrega_cliente: "",
    notas: "",
  });

  // Opciones de laboratorio
  const laboratorios = ["Essilor", "Augen", "Eva"];

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

  // Cargar datos iniciales
  useEffect(() => {
    if (clienteId) {
      cargarCliente(clienteId);
    } else {
      cargarClientes();
    }

    // Si hay venta existente, cargar datos
    if (ventaExistente) {
      setDatosVenta({
        cliente_id: ventaExistente.cliente_id || "",
        marca_armazon: ventaExistente.marca_armazon || "",
        laboratorio: ventaExistente.laboratorio || "",
        precio_armazon: ventaExistente.precio_armazon?.toString() || "",
        precio_micas: ventaExistente.precio_micas?.toString() || "",
        costo_total: ventaExistente.costo_total?.toString() || "",
        deposito_inicial: ventaExistente.deposito_inicial?.toString() || "",
        saldo_restante: ventaExistente.saldo_restante?.toString() || "",
        estado: ventaExistente.estado || "pendiente",
        fecha_venta:
          ventaExistente.fecha_venta?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        fecha_llegada_laboratorio:
          ventaExistente.fecha_llegada_laboratorio?.split("T")[0] || "",
        fecha_entrega_cliente:
          ventaExistente.fecha_entrega_cliente?.split("T")[0] || "",
        notas: ventaExistente.notas || "",
      });

      if (ventaExistente.imagen_receta) {
        setVistaPrevia(`/uploads/${ventaExistente.imagen_receta}`);
      }
    }
  }, [clienteId, ventaExistente]);

  // Calcular saldo restante automáticamente
  useEffect(() => {
    const costoTotal = parsearDinero(datosVenta.costo_total);
    const deposito = parsearDinero(datosVenta.deposito_inicial);
    const saldo = restarDinero(costoTotal, deposito);

    setDatosVenta((prev) => ({
      ...prev,
      saldo_restante: saldo >= 0 ? saldo.toString() : "0",
    }));
  }, [datosVenta.costo_total, datosVenta.deposito_inicial]);

  // Calcular costo total automáticamente
  useEffect(() => {
    const precioArmazon = parsearDinero(datosVenta.precio_armazon);
    const precioMicas = parsearDinero(datosVenta.precio_micas);
    const total = sumarDinero(precioArmazon, precioMicas);

    if (total > 0) {
      setDatosVenta((prev) => ({
        ...prev,
        costo_total: total.toString(),
      }));
    }
  }, [datosVenta.precio_armazon, datosVenta.precio_micas]);

  const cargarCliente = async (id) => {
    try {
      const respuesta = await fetch(`/api/clientes/${id}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setCliente(datos.cliente);
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
    }
  };

  const cargarClientes = async (termino = "") => {
    try {
      const url = termino
        ? `/api/clientes?buscar=${encodeURIComponent(termino)}`
        : `/api/clientes`;

      const respuesta = await fetch(url, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setClientes(datos.clientes || []);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    }
  };

  const buscarClientes = async (termino) => {
    setBusquedaCliente(termino);
    if (termino.length >= 2) {
      await cargarClientes(termino);
    } else if (termino.length === 0) {
      await cargarClientes();
    }
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatosVenta((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const manejarSeleccionCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    setDatosVenta((prev) => ({
      ...prev,
      cliente_id: clienteSeleccionado.id,
    }));
    setClientes([]);
    setBusquedaCliente("");
  };

  const manejarArchivoReceta = (evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      if (archivo.size > 10 * 1024 * 1024) {
        setErrores((prev) => ({
          ...prev,
          archivo: "El archivo no debe exceder 10MB",
        }));
        return;
      }

      setArchivoReceta(archivo);
      const url = URL.createObjectURL(archivo);
      setVistaPrevia(url);

      if (errores.archivo) {
        setErrores((prev) => ({
          ...prev,
          archivo: "",
        }));
      }
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosVenta.cliente_id) {
      nuevosErrores.cliente_id = "Cliente es requerido";
    }

    if (!datosVenta.costo_total || parseFloat(datosVenta.costo_total) <= 0) {
      nuevosErrores.costo_total = "Costo total es requerido";
    }

    if (
      datosVenta.deposito_inicial &&
      parseFloat(datosVenta.deposito_inicial) >
        parseFloat(datosVenta.costo_total || 0)
    ) {
      nuevosErrores.deposito_inicial =
        "El depósito no puede ser mayor al costo total";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const formData = new FormData();

      // Agregar datos del formulario
      Object.keys(datosVenta).forEach((key) => {
        if (datosVenta[key] !== "") {
          formData.append(key, datosVenta[key]);
        }
      });

      // Agregar archivo si existe
      if (archivoReceta) {
        formData.append("imagen_receta", archivoReceta);
      }

      const url = ventaExistente
        ? `/api/ventas/${ventaExistente.id}`
        : "/api/ventas";
      const metodo = ventaExistente ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        credentials: "include",
        body: formData,
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setMensaje(
          ventaExistente
            ? "Venta actualizada exitosamente"
            : "Venta creada exitosamente"
        );

        setTimeout(() => {
          if (clienteId) {
            router.push(`/clientes/${clienteId}`);
          } else {
            router.push("/ventas");
          }
        }, 1500);
      } else {
        const errorData = await respuesta.json();
        setMensaje(errorData.error || "Error procesando la venta");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

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

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
            {ventaExistente ? "Editar Venta" : "Nueva Venta"}
          </span>
        </nav>

        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-2xl mb-6">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {ventaExistente ? "Actualizar Venta" : "Nueva Venta"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {ventaExistente
              ? "Modifica los detalles de la venta existente"
              : "Complete la información de la nueva venta para el cliente"}
          </p>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              mensaje.includes("Error")
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mensaje.includes("Error") ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                )}
              </svg>
              {mensaje}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={enviarFormulario} className="space-y-8">
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
                <p className="text-gray-600">Seleccione o busque el cliente</p>
              </div>
            </div>

            {!clienteId && !cliente ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Cliente
                  </label>
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => buscarClientes(e.target.value)}
                    placeholder="Escriba el nombre del cliente..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                  />
                </div>

                {clientes.length > 0 && (
                  <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
                    {clientes.map((clienteItem) => (
                      <button
                        key={clienteItem.id}
                        type="button"
                        onClick={() => manejarSeleccionCliente(clienteItem)}
                        className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {clienteItem.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {clienteItem.expediente &&
                            `Exp: ${clienteItem.expediente}`}
                          {clienteItem.email && ` • ${clienteItem.email}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {errores.cliente_id && (
                  <p className="text-red-600 text-sm">{errores.cliente_id}</p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#095a6d]/5 to-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cliente?.nombre_completo || "Cliente Seleccionado"}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      {cliente?.expediente && (
                        <span>Exp: {cliente.expediente}</span>
                      )}
                      {cliente?.email && <span>{cliente.email}</span>}
                      {cliente?.telefono && <span>{cliente.telefono}</span>}
                    </div>
                  </div>
                  {!clienteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setCliente(null);
                        setDatosVenta((prev) => ({ ...prev, cliente_id: "" }));
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Información del Producto */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca del Armazón
                </label>
                <input
                  type="text"
                  name="marca_armazon"
                  value={datosVenta.marca_armazon}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                  placeholder="Ej: Ray-Ban, Oakley..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Laboratorio
                </label>
                <select
                  name="laboratorio"
                  value={datosVenta.laboratorio}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                >
                  <option value="">Seleccionar laboratorio</option>
                  {laboratorios.map((lab, index) => (
                    <option key={index} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio del Armazón
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="precio_armazon"
                    value={datosVenta.precio_armazon}
                    onChange={manejarCambio}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de las Micas
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="precio_micas"
                    value={datosVenta.precio_micas}
                    onChange={manejarCambio}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Total *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="costo_total"
                    value={datosVenta.costo_total}
                    onChange={manejarCambio}
                    min="0.01"
                    step="0.01"
                    required
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent ${
                      errores.costo_total ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errores.costo_total && (
                  <p className="text-red-600 text-sm mt-1">
                    {errores.costo_total}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depósito Inicial
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="deposito_inicial"
                    value={datosVenta.deposito_inicial}
                    onChange={manejarCambio}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent ${
                      errores.deposito_inicial
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errores.deposito_inicial && (
                  <p className="text-red-600 text-sm mt-1">
                    {errores.deposito_inicial}
                  </p>
                )}
              </div>
            </div>

            {/* Saldo Restante (automático) */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Saldo Restante:
                </span>
                <span className="text-lg font-bold text-[#095a6d]">
                  ${parseFloat(datosVenta.saldo_restante || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Receta Médica */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Receta Médica
                </h2>
                <p className="text-gray-600">
                  Subir imagen o archivo de la receta (opcional)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de Receta
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#095a6d] transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="archivo-receta"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#095a6d] hover:text-[#073d4a] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#095a6d]"
                    >
                      <span>Subir un archivo</span>
                      <input
                        id="archivo-receta"
                        name="archivo-receta"
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={manejarArchivoReceta}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </p>
                </div>
              </div>

              {errores.archivo && (
                <p className="text-red-600 text-sm mt-1">{errores.archivo}</p>
              )}

              {vistaPrevia && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa:
                  </h4>
                  <div className="max-w-xs">
                    <img
                      src={vistaPrevia}
                      alt="Vista previa de la receta"
                      className="w-full border rounded-xl shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado y Fechas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
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
                  Estado y Fechas
                </h2>
                <p className="text-gray-600">Control del proceso de la venta</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Venta
                </label>
                <select
                  name="estado"
                  value={datosVenta.estado}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                >
                  {estadosVenta.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Venta
                </label>
                <input
                  type="date"
                  name="fecha_venta"
                  value={datosVenta.fecha_venta}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Llegada del Laboratorio
                </label>
                <input
                  type="date"
                  name="fecha_llegada_laboratorio"
                  value={datosVenta.fecha_llegada_laboratorio}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega al Cliente
                </label>
                <input
                  type="date"
                  name="fecha_entrega_cliente"
                  value={datosVenta.fecha_entrega_cliente}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
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
                <p className="text-gray-600">
                  Información adicional sobre la venta
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notas"
                value={datosVenta.notas}
                onChange={manejarCambio}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d] focus:border-transparent resize-none"
                placeholder="Observaciones especiales, preferencias del cliente, etc..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              href={clienteId ? `/clientes/${clienteId}` : "/ventas"}
              className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors duration-200"
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
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={cargando}
              className={`flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] hover:from-[#073d4a] hover:to-[#0a3b50] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                cargando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {cargando ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {ventaExistente ? "Actualizando..." : "Guardando..."}
                </div>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {ventaExistente ? "Actualizar Venta" : "Crear Venta"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
