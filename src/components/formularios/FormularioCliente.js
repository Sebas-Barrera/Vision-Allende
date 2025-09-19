"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FormularioCliente({ clienteId = null }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  // Estado del formulario
  const [datosCliente, setDatosCliente] = useState({
    // Datos personales básicos
    nombre_completo: "",
    fecha_nacimiento: "",
    edad: "",
    ocupacion: "",
    direccion: "",
    email: "",
    telefono: "",
    celular: "",
    motivo_consulta: "",

    // Datos médicos básicos
    peso: "",
    talla: "",
    imc: "",
    fr: "", // Frecuencia respiratoria
    temperatura: "",
    saturacion_oxigeno: "",
    ritmo_cardiaco: "",
    presion_arterial: "",

    // Antecedentes médicos
    presion_alta: false,
    diabetes: false,
    alergias: "",
    notas_extras: "",
  });

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (clienteId) {
      cargarDatosCliente();
    }
  }, [clienteId]);

  const cargarDatosCliente = async () => {
    setCargandoCliente(true);
    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        const cliente = datos.cliente;

        // Rellenar el formulario con los datos existentes
        setDatosCliente({
          nombre_completo: cliente.nombre_completo || "",
          fecha_nacimiento: cliente.fecha_nacimiento
            ? cliente.fecha_nacimiento.split("T")[0]
            : "",
          edad: cliente.edad?.toString() || "",
          ocupacion: cliente.ocupacion || "",
          direccion: cliente.direccion || "",
          email: cliente.email || "",
          telefono: cliente.telefono || "",
          celular: cliente.celular || "",
          motivo_consulta: cliente.motivo_consulta || "",
          peso: cliente.peso?.toString() || "",
          talla: cliente.talla?.toString() || "",
          imc: cliente.imc?.toString() || "",
          fr: cliente.fr?.toString() || "",
          temperatura: cliente.temperatura?.toString() || "",
          saturacion_oxigeno: cliente.saturacion_oxigeno?.toString() || "",
          ritmo_cardiaco: cliente.ritmo_cardiaco?.toString() || "",
          presion_arterial: cliente.presion_arterial || "",
          presion_alta: cliente.presion_alta || false,
          diabetes: cliente.diabetes || false,
          alergias: cliente.alergias || "",
          notas_extras: cliente.antecedentes_notas || "",
        });
      } else {
        setMensaje("Error: Cliente no encontrado");
      }
    } catch (error) {
      setMensaje("Error cargando datos del cliente");
    } finally {
      setCargandoCliente(false);
    }
  };

  // Calcular IMC automáticamente
  useEffect(() => {
    if (datosCliente.peso && datosCliente.talla) {
      const peso = parseFloat(datosCliente.peso);
      const talla = parseFloat(datosCliente.talla);
      if (peso > 0 && talla > 0) {
        const imc = peso / (talla * talla);
        setDatosCliente((prev) => ({
          ...prev,
          imc: imc.toFixed(2),
        }));
      }
    }
  }, [datosCliente.peso, datosCliente.talla]);

  // Calcular edad automáticamente
  useEffect(() => {
    if (datosCliente.fecha_nacimiento) {
      const nacimiento = new Date(datosCliente.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }

      if (edad >= 0 && edad <= 120) {
        setDatosCliente((prev) => ({
          ...prev,
          edad: edad.toString(),
        }));
      }
    }
  }, [datosCliente.fecha_nacimiento]);

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target;

    setDatosCliente((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar errores del campo
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosCliente.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = "Nombre completo es requerido";
    }

    if (datosCliente.email && !/^\S+@\S+\.\S+$/.test(datosCliente.email)) {
      nuevosErrores.email = "Formato de email inválido";
    }

    if (
      datosCliente.peso &&
      (isNaN(datosCliente.peso) || parseFloat(datosCliente.peso) <= 0)
    ) {
      nuevosErrores.peso = "Peso debe ser un número válido mayor a 0";
    }

    if (
      datosCliente.talla &&
      (isNaN(datosCliente.talla) || parseFloat(datosCliente.talla) <= 0)
    ) {
      nuevosErrores.talla = "Talla debe ser un número válido mayor a 0";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const url = clienteId ? `/api/clientes/${clienteId}` : "/api/clientes";
      const metodo = clienteId ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(datosCliente),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(
          clienteId
            ? "Cliente actualizado exitosamente"
            : "Cliente registrado exitosamente"
        );

        if (!clienteId) {
          // Limpiar formulario después de crear
          setDatosCliente({
            nombre_completo: "",
            fecha_nacimiento: "",
            edad: "",
            ocupacion: "",
            direccion: "",
            email: "",
            telefono: "",
            celular: "",
            motivo_consulta: "",
            peso: "",
            talla: "",
            imc: "",
            fr: "",
            temperatura: "",
            saturacion_oxigeno: "",
            ritmo_cardiaco: "",
            presion_arterial: "",
            presion_alta: false,
            diabetes: false,
            alergias: "",
            notas_extras: "",
          });
        }

        // Redirigir después de 2 segundos
        setTimeout(() => {
          if (clienteId) {
            router.push(`/clientes/${clienteId}`);
          } else {
            router.push("/clientes");
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

  const eliminarCliente = async () => {
    if (
      !confirm(
        "¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "⚠️ ADVERTENCIA: Se eliminarán todos los datos relacionados del cliente. ¿Confirma la eliminación?"
      )
    ) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje("Cliente eliminado exitosamente");
        setTimeout(() => {
          router.push("/clientes");
        }, 1500);
      } else {
        setMensaje(`Error: ${datos.error}`);
      }
    } catch (error) {
      setMensaje("Error de conexión. Intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  // Mostrar spinner si está cargando datos del cliente
  if (clienteId && cargandoCliente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#095a6d]/30 border-t-[#095a6d] rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando datos del cliente
          </h2>
          <p className="text-gray-600">Obteniendo información para editar...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/clientes" className="hover:text-[#095a6d]">
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
            {clienteId ? "Editar Cliente" : "Nuevo Cliente"}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {clienteId ? "Actualizar Cliente" : "Nuevo Cliente"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {clienteId
              ? "Modifica la información del expediente médico del cliente"
              : "Complete la información del expediente médico para el nuevo cliente"}
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
        <form onSubmit={manejarSubmit} className="space-y-8">
          {/* Datos Personales */}
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Datos Personales
                </h2>
                <p className="text-gray-600">Información básica del cliente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={datosCliente.nombre_completo}
                  onChange={manejarCambio}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 ${
                    errores.nombre_completo
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white/70"
                  }`}
                  placeholder="Nombre completo del cliente"
                  required
                />
                {errores.nombre_completo && (
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
                    {errores.nombre_completo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={datosCliente.fecha_nacimiento}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  name="edad"
                  value={datosCliente.edad}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="Años"
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ocupación
                </label>
                <input
                  type="text"
                  name="ocupacion"
                  value={datosCliente.ocupacion}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="Ocupación del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={datosCliente.direccion}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={datosCliente.email}
                  onChange={manejarCambio}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 ${
                    errores.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white/70"
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {errores.email && (
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
                    {errores.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={datosCliente.telefono}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="123-456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Celular
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={datosCliente.celular}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="123-456-7890"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de Consulta
                </label>
                <textarea
                  name="motivo_consulta"
                  value={datosCliente.motivo_consulta}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 resize-none"
                  rows={3}
                  placeholder="Describe el motivo de la consulta..."
                />
              </div>
            </div>
          </div>

          {/* Datos Médicos */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Datos Médicos
                </h2>
                <p className="text-gray-600">
                  Información médica básica del cliente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  value={datosCliente.peso}
                  onChange={manejarCambio}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 ${
                    errores.peso
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white/70"
                  }`}
                  placeholder="70.5"
                />
                {errores.peso && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
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
                    {errores.peso}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Talla (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="talla"
                  value={datosCliente.talla}
                  onChange={manejarCambio}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 ${
                    errores.talla
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white/70"
                  }`}
                  placeholder="1.70"
                />
                {errores.talla && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
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
                    {errores.talla}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IMC (Calculado)
                </label>
                <input
                  type="text"
                  name="imc"
                  value={datosCliente.imc}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  placeholder="Calculado automáticamente"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frecuencia Respiratoria
                </label>
                <input
                  type="number"
                  name="fr"
                  value={datosCliente.fr}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperatura"
                  value={datosCliente.temperatura}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="36.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Saturación O2 (%)
                </label>
                <input
                  type="number"
                  name="saturacion_oxigeno"
                  value={datosCliente.saturacion_oxigeno}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="98"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ritmo Cardíaco
                </label>
                <input
                  type="number"
                  name="ritmo_cardiaco"
                  value={datosCliente.ritmo_cardiaco}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Presión Arterial
                </label>
                <input
                  type="text"
                  name="presion_arterial"
                  value={datosCliente.presion_arterial}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                  placeholder="120/80"
                />
              </div>
            </div>
          </div>

          {/* Antecedentes Médicos */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Antecedentes Médicos
                </h2>
                <p className="text-gray-600">Historial médico del cliente</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 cursor-pointer hover:border-red-200 transition-colors">
                  <input
                    type="checkbox"
                    name="presion_alta"
                    checked={datosCliente.presion_alta}
                    onChange={manejarCambio}
                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Presión arterial alta
                  </span>
                </label>

                <label className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 cursor-pointer hover:border-blue-200 transition-colors">
                  <input
                    type="checkbox"
                    name="diabetes"
                    checked={datosCliente.diabetes}
                    onChange={manejarCambio}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Diabetes
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alergias
                </label>
                <textarea
                  name="alergias"
                  value={datosCliente.alergias}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 resize-none"
                  rows={3}
                  placeholder="Describe alergias conocidas..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  name="notas_extras"
                  value={datosCliente.notas_extras}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 resize-none"
                  rows={4}
                  placeholder="Información médica adicional relevante..."
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/clientes")}
              className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors duration-200"
              disabled={cargando}
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
            </button>

            {/* Botón eliminar - solo mostrar si estamos editando */}
            {clienteId && (
              <button
                type="button"
                onClick={eliminarCliente}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={cargando}
              >
                {cargando ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Eliminando...
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
                        d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Eliminar Cliente
                  </>
                )}
              </button>
            )}

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
                  {clienteId ? "Actualizando..." : "Registrando..."}
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
                  {clienteId ? "Actualizar Cliente" : "Registrar Cliente"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
