"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

    // Información del producto
    marca_armazon: "",
    laboratorio: "",
    precio_armazon: "",
    precio_micas: "",
    costo_total: "",

    // Control de pagos
    deposito_inicial: "",
    saldo_restante: "",

    // Estado y fechas
    estado: "pendiente",
    fecha_venta: new Date().toISOString().split("T")[0],
    fecha_llegada_laboratorio: "",
    fecha_entrega_cliente: "",

    // Notas
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
        precio_armazon: ventaExistente.precio_armazon || "",
        precio_micas: ventaExistente.precio_micas || "",
        costo_total: ventaExistente.costo_total || "",
        deposito_inicial: ventaExistente.total_depositado || "",
        saldo_restante: ventaExistente.saldo_restante || "",
        estado: ventaExistente.estado || "pendiente",
        fecha_venta:
          ventaExistente.fecha_venta || new Date().toISOString().split("T")[0],
        fecha_llegada_laboratorio:
          ventaExistente.fecha_llegada_laboratorio || "",
        fecha_entrega_cliente: ventaExistente.fecha_entrega_cliente || "",
        notas: ventaExistente.notas || "",
      });

      if (ventaExistente.imagen_receta) {
        setVistaPrevia(ventaExistente.imagen_receta);
      }
    }
  }, [clienteId, ventaExistente]);

  // Calcular automáticamente costo total y saldo restante
  useEffect(() => {
    const armazon = parseFloat(datosVenta.precio_armazon) || 0;
    const micas = parseFloat(datosVenta.precio_micas) || 0;
    const total = armazon + micas;

    setDatosVenta((prev) => ({
      ...prev,
      costo_total: total > 0 ? total.toFixed(2) : "",
    }));
  }, [datosVenta.precio_armazon, datosVenta.precio_micas]);

  useEffect(() => {
    const total = parseFloat(datosVenta.costo_total) || 0;
    const deposito = parseFloat(datosVenta.deposito_inicial) || 0;
    const saldo = total - deposito;

    setDatosVenta((prev) => ({
      ...prev,
      saldo_restante: total > 0 ? saldo.toFixed(2) : "",
    }));
  }, [datosVenta.costo_total, datosVenta.deposito_inicial]);

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

  const cargarClientes = async () => {
    try {
      const respuesta = await fetch("/api/clientes?limite=100", {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setClientes(datos.clientes);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const buscarClientes = async (termino) => {
    if (termino.length < 2) {
      cargarClientes();
      return;
    }

    try {
      const respuesta = await fetch(
        `/api/clientes?busqueda=${encodeURIComponent(termino)}`,
        {
          credentials: "include",
        }
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setClientes(datos.clientes);
      }
    } catch (error) {
      console.error("Error buscando clientes:", error);
    }
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setDatosVenta((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores del campo
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const manejarBusquedaCliente = (evento) => {
    const valor = evento.target.value;
    setBusquedaCliente(valor);
    buscarClientes(valor);
  };

  const seleccionarCliente = (cliente) => {
    setDatosVenta((prev) => ({
      ...prev,
      cliente_id: cliente.id,
    }));
    setCliente(cliente);
    setBusquedaCliente("");
  };

  const manejarArchivoReceta = (evento) => {
    const archivo = evento.target.files[0];

    if (archivo) {
      // Validar tipo de archivo
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!tiposPermitidos.includes(archivo.type)) {
        setMensaje("Solo se permiten archivos JPG, JPEG, PNG o PDF");
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        setMensaje("El archivo no debe exceder 10MB");
        return;
      }

      setArchivoReceta(archivo);

      // Crear vista previa para imágenes
      if (archivo.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setVistaPrevia(e.target.result);
        };
        reader.readAsDataURL(archivo);
      } else {
        setVistaPrevia("PDF adjunto: " + archivo.name);
      }
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar cliente
    if (!datosVenta.cliente_id) {
      nuevosErrores.cliente_id = "Cliente es requerido";
    }

    // Validar precios
    if (!datosVenta.precio_armazon && !datosVenta.precio_micas) {
      nuevosErrores.precio_armazon =
        "Debe especificar al menos precio de armazón o micas";
    }

    if (
      datosVenta.precio_armazon &&
      parseFloat(datosVenta.precio_armazon) < 0
    ) {
      nuevosErrores.precio_armazon = "El precio no puede ser negativo";
    }

    if (datosVenta.precio_micas && parseFloat(datosVenta.precio_micas) < 0) {
      nuevosErrores.precio_micas = "El precio no puede ser negativo";
    }

    // Validar costo total
    if (!datosVenta.costo_total || parseFloat(datosVenta.costo_total) <= 0) {
      nuevosErrores.costo_total = "Costo total debe ser mayor a 0";
    }

    // Validar depósito inicial
    if (datosVenta.deposito_inicial) {
      const deposito = parseFloat(datosVenta.deposito_inicial);
      const total = parseFloat(datosVenta.costo_total);

      if (deposito < 0) {
        nuevosErrores.deposito_inicial = "El depósito no puede ser negativo";
      } else if (deposito > total) {
        nuevosErrores.deposito_inicial =
          "El depósito no puede ser mayor al costo total";
      }
    }

    // Validar fechas
    if (datosVenta.fecha_llegada_laboratorio && datosVenta.fecha_venta) {
      if (
        new Date(datosVenta.fecha_llegada_laboratorio) <
        new Date(datosVenta.fecha_venta)
      ) {
        nuevosErrores.fecha_llegada_laboratorio =
          "No puede ser anterior a la fecha de venta";
      }
    }

    if (
      datosVenta.fecha_entrega_cliente &&
      datosVenta.fecha_llegada_laboratorio
    ) {
      if (
        new Date(datosVenta.fecha_entrega_cliente) <
        new Date(datosVenta.fecha_llegada_laboratorio)
      ) {
        nuevosErrores.fecha_entrega_cliente =
          "No puede ser anterior a la llegada del laboratorio";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      let rutaReceta = "";

      // Subir archivo de receta si hay uno
      if (archivoReceta) {
        const formData = new FormData();
        formData.append("archivo", archivoReceta);
        formData.append("tipo", "receta");

        const respuestaArchivo = await fetch("/api/archivos/subir", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (respuestaArchivo.ok) {
          const datosArchivo = await respuestaArchivo.json();
          rutaReceta = datosArchivo.ruta;
        }
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        ...datosVenta,
        imagen_receta: rutaReceta || vistaPrevia || null,
      };

      // Determinar URL y método
      const url = ventaExistente
        ? `/api/ventas/${ventaExistente.id}`
        : "/api/ventas";
      const metodo = ventaExistente ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(datosParaEnviar),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(
          ventaExistente
            ? "Venta actualizada exitosamente"
            : "Venta registrada exitosamente"
        );

        // Redirigir después de 2 segundos
        setTimeout(() => {
          if (clienteId) {
            router.push(`/clientes/${clienteId}`);
          } else {
            router.push("/ventas");
          }
        }, 2000);
      } else {
        setMensaje(`Error: ${datos.error}`);
      }
    } catch (error) {
      setMensaje("Error de conexión. Intente nuevamente.");
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
                href="/reportes"
                className="text-gray-600 hover:text-gray-900"
              >
                📊 Reportes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {ventaExistente ? "Editar Venta" : "Nueva Venta"}
                </h2>
                {cliente && (
                  <p className="text-gray-600 mt-1">
                    Cliente:{" "}
                    <span className="font-medium">
                      {cliente.nombre_completo}
                    </span>
                    {cliente.expediente && (
                      <span className="text-sm">
                        {" "}
                        (Exp: {cliente.expediente})
                      </span>
                    )}
                  </p>
                )}
              </div>

              {ventaExistente && (
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      estadosVenta.find((e) => e.valor === datosVenta.estado)
                        ?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {estadosVenta.find((e) => e.valor === datosVenta.estado)
                      ?.label || datosVenta.estado}
                  </span>
                </div>
              )}
            </div>
          </div>

          {mensaje && (
            <div
              className={`mx-6 mt-4 p-4 rounded-md ${
                mensaje.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={manejarSubmit} className="p-6 space-y-6">
            {/* Selección de Cliente */}
            {!clienteId && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Seleccionar Cliente
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buscar Cliente
                    </label>
                    <input
                      type="text"
                      value={busquedaCliente}
                      onChange={manejarBusquedaCliente}
                      className="form-input"
                      placeholder="Escriba nombre o expediente del cliente..."
                    />
                  </div>

                  {clientes.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      {clientes.map((clienteItem) => (
                        <div
                          key={clienteItem.id}
                          onClick={() => seleccionarCliente(clienteItem)}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            datosVenta.cliente_id === clienteItem.id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {clienteItem.nombre_completo}
                              </p>
                              <p className="text-sm text-gray-600">
                                {clienteItem.expediente &&
                                  `Exp: ${clienteItem.expediente} • `}
                                {clienteItem.email ||
                                  clienteItem.celular ||
                                  "Sin contacto"}
                              </p>
                            </div>
                            {datosVenta.cliente_id === clienteItem.id && (
                              <span className="text-blue-600 text-sm">
                                ✓ Seleccionado
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errores.cliente_id && (
                    <p className="text-red-600 text-sm">{errores.cliente_id}</p>
                  )}
                </div>
              </div>
            )}

            {/* Información del Producto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Producto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca del Armazón
                  </label>
                  <input
                    type="text"
                    name="marca_armazon"
                    value={datosVenta.marca_armazon}
                    onChange={manejarCambio}
                    className="form-input"
                    placeholder="Ej: Ray-Ban, Oakley, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laboratorio
                  </label>
                  <select
                    name="laboratorio"
                    value={datosVenta.laboratorio}
                    onChange={manejarCambio}
                    className="form-input"
                  >
                    <option value="">Seleccionar laboratorio...</option>
                    {laboratorios.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Armazón
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_armazon"
                    value={datosVenta.precio_armazon}
                    onChange={manejarCambio}
                    className={`form-input ${
                      errores.precio_armazon ? "border-red-300" : ""
                    }`}
                    placeholder="0.00"
                  />
                  {errores.precio_armazon && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.precio_armazon}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Micas
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_micas"
                    value={datosVenta.precio_micas}
                    onChange={manejarCambio}
                    className={`form-input ${
                      errores.precio_micas ? "border-red-300" : ""
                    }`}
                    placeholder="0.00"
                  />
                  {errores.precio_micas && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.precio_micas}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Costo Total</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatearDinero(datosVenta.costo_total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Depósito</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatearDinero(datosVenta.deposito_inicial)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Saldo Restante</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatearDinero(datosVenta.saldo_restante)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {errores.costo_total && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.costo_total}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Control de Pagos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Control de Pagos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Depósito Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="deposito_inicial"
                    value={datosVenta.deposito_inicial}
                    onChange={manejarCambio}
                    className={`form-input ${
                      errores.deposito_inicial ? "border-red-300" : ""
                    }`}
                    placeholder="0.00"
                  />
                  {errores.deposito_inicial && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.deposito_inicial}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saldo Restante (Calculado)
                  </label>
                  <input
                    type="text"
                    value={formatearDinero(datosVenta.saldo_restante)}
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Estado y Fechas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estado y Fechas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado de la Venta
                  </label>
                  <select
                    name="estado"
                    value={datosVenta.estado}
                    onChange={manejarCambio}
                    className="form-input"
                  >
                    {estadosVenta.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Venta
                  </label>
                  <input
                    type="date"
                    name="fecha_venta"
                    value={datosVenta.fecha_venta}
                    onChange={manejarCambio}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Llegada del Laboratorio
                  </label>
                  <input
                    type="date"
                    name="fecha_llegada_laboratorio"
                    value={datosVenta.fecha_llegada_laboratorio}
                    onChange={manejarCambio}
                    className={`form-input ${
                      errores.fecha_llegada_laboratorio ? "border-red-300" : ""
                    }`}
                  />
                  {errores.fecha_llegada_laboratorio && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.fecha_llegada_laboratorio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Entrega al Cliente
                  </label>
                  <input
                    type="date"
                    name="fecha_entrega_cliente"
                    value={datosVenta.fecha_entrega_cliente}
                    onChange={manejarCambio}
                    className={`form-input ${
                      errores.fecha_entrega_cliente ? "border-red-300" : ""
                    }`}
                  />
                  {errores.fecha_entrega_cliente && (
                    <p className="text-red-600 text-xs mt-1">
                      {errores.fecha_entrega_cliente}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Receta Médica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Receta Médica (Opcional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir imagen o PDF de la receta
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={manejarArchivoReceta}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: JPG, JPEG, PNG, PDF (máximo 10MB)
                  </p>
                </div>

                {vistaPrevia && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista previa
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {vistaPrevia.startsWith("data:image") ? (
                        <img
                          src={vistaPrevia}
                          alt="Vista previa de receta"
                          className="max-w-full h-32 object-contain mx-auto"
                        />
                      ) : (
                        <div className="text-center py-4">
                          <span className="text-gray-600">{vistaPrevia}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setVistaPrevia("");
                          setArchivoReceta(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 w-full"
                      >
                        Eliminar archivo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas y Observaciones
              </label>
              <textarea
                name="notas"
                value={datosVenta.notas}
                onChange={manejarCambio}
                rows="3"
                className="form-input resize-vertical"
                placeholder="Observaciones adicionales sobre la venta..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (clienteId) {
                      router.push(`/clientes/${clienteId}`);
                    } else {
                      router.push("/ventas");
                    }
                  }}
                  className="btn btn-secondary"
                  disabled={cargando}
                >
                  Cancelar
                </button>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className={`btn btn-primary ${
                  cargando ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {cargando ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    {ventaExistente ? "Actualizando..." : "Guardando..."}
                  </div>
                ) : ventaExistente ? (
                  "Actualizar Venta"
                ) : (
                  "Registrar Venta"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
