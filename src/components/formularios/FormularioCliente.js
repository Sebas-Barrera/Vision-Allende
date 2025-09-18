"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FormularioCliente({ clienteId = null }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
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

    // Validar campos requeridos
    if (!datosCliente.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = "Nombre completo es requerido";
    }

    // Validar email si se proporciona
    if (
      datosCliente.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)
    ) {
      nuevosErrores.email = "Formato de email inválido";
    }

    // Validar teléfonos si se proporcionan
    if (
      datosCliente.telefono &&
      !/^\d{10}$/.test(datosCliente.telefono.replace(/\D/g, ""))
    ) {
      nuevosErrores.telefono = "Teléfono debe tener 10 dígitos";
    }

    if (
      datosCliente.celular &&
      !/^\d{10}$/.test(datosCliente.celular.replace(/\D/g, ""))
    ) {
      nuevosErrores.celular = "Celular debe tener 10 dígitos";
    }

    // Validar rangos numéricos
    if (
      datosCliente.edad &&
      (parseInt(datosCliente.edad) < 1 || parseInt(datosCliente.edad) > 120)
    ) {
      nuevosErrores.edad = "Edad debe estar entre 1 y 120 años";
    }

    if (
      datosCliente.peso &&
      (parseFloat(datosCliente.peso) < 1 || parseFloat(datosCliente.peso) > 500)
    ) {
      nuevosErrores.peso = "Peso debe estar entre 1 y 500 kg";
    }

    if (
      datosCliente.talla &&
      (parseFloat(datosCliente.talla) < 0.5 ||
        parseFloat(datosCliente.talla) > 3)
    ) {
      nuevosErrores.talla = "Talla debe estar entre 0.5 y 3 metros";
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
          router.push("/clientes");
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
                    {clienteId ? "Editar Cliente" : "Nuevo Cliente"}
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
                className="px-4 py-2 text-gray-700 hover:text-[#095a6d] hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              >
                Clientes
              </Link>
            </nav>

            {/* Botón Logout */}
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#095a6d] transition-colors">
              Dashboard
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/clientes" className="hover:text-[#095a6d] transition-colors">
              Clientes
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">
              {clienteId ? "Editar" : "Nuevo"}
            </span>
          </nav>
        </div>

        {/* Header de la página */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {clienteId ? "Editar Cliente" : "Registro de Nuevo Cliente"}
          </h2>
          <p className="text-gray-600 text-lg">
            Complete la información del expediente médico. Los campos marcados con * son obligatorios.
          </p>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 rounded-2xl p-4 border ${
            mensaje.includes("Error")
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}>
            <div className="flex items-center space-x-2">
              {mensaje.includes("Error") ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="font-medium">{mensaje}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-3xl border border-gray-200/50 shadow-sm overflow-hidden">
          <form onSubmit={manejarSubmit}>
            {/* Datos Personales */}
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Datos Personales</h3>
                  <p className="text-sm text-gray-600">Información básica del cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nombre Completo */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={datosCliente.nombre_completo}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.nombre_completo
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errores.nombre_completo && (
                    <p className="mt-1 text-sm text-red-600">{errores.nombre_completo}</p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={datosCliente.fecha_nacimiento}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                  />
                </div>

                {/* Edad (solo lectura) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="edad"
                    value={datosCliente.edad}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Se calcula automáticamente"
                    min="1"
                    max="120"
                  />
                  {errores.edad && (
                    <p className="mt-1 text-sm text-red-600">{errores.edad}</p>
                  )}
                </div>

                {/* Ocupación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    name="ocupacion"
                    value={datosCliente.ocupacion}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Ej: Ingeniero, Estudiante..."
                  />
                </div>

                {/* Dirección */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={datosCliente.direccion}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Calle, colonia, ciudad..."
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Información de Contacto</h3>
                  <p className="text-sm text-gray-600">Datos para comunicación</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={datosCliente.email}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errores.email && (
                    <p className="mt-1 text-sm text-red-600">{errores.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={datosCliente.telefono}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.telefono
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="01 234 567 8900"
                  />
                  {errores.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
                  )}
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={datosCliente.celular}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.celular
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="044 234 567 8900"
                  />
                  {errores.celular && (
                    <p className="mt-1 text-sm text-red-600">{errores.celular}</p>
                  )}
                </div>

                {/* Motivo de Consulta */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Motivo de Consulta
                  </label>
                  <textarea
                    name="motivo_consulta"
                    value={datosCliente.motivo_consulta}
                    onChange={manejarCambio}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 resize-none"
                    placeholder="Describa el motivo de la consulta..."
                  />
                </div>
              </div>
            </div>

            {/* Datos Médicos */}
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Datos Médicos</h3>
                  <p className="text-sm text-gray-600">Información de salud básica</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Peso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={datosCliente.peso}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.peso
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="70.5"
                    step="0.1"
                    min="1"
                    max="500"
                  />
                  {errores.peso && (
                    <p className="mt-1 text-sm text-red-600">{errores.peso}</p>
                  )}
                </div>

                {/* Talla */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Talla (m)
                  </label>
                  <input
                    type="number"
                    name="talla"
                    value={datosCliente.talla}
                    onChange={manejarCambio}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errores.talla
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20"
                    } focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400`}
                    placeholder="1.75"
                    step="0.01"
                    min="0.5"
                    max="3"
                  />
                  {errores.talla && (
                    <p className="mt-1 text-sm text-red-600">{errores.talla}</p>
                  )}
                </div>

                {/* IMC (solo lectura) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    IMC
                  </label>
                  <input
                    type="text"
                    name="imc"
                    value={datosCliente.imc}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 focus:outline-none"
                    placeholder="Se calcula automáticamente"
                  />
                </div>

                {/* Frecuencia Respiratoria */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    FR (resp/min)
                  </label>
                  <input
                    type="number"
                    name="fr"
                    value={datosCliente.fr}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="20"
                    min="1"
                    max="100"
                  />
                </div>

                {/* Temperatura */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    name="temperatura"
                    value={datosCliente.temperatura}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="36.5"
                    step="0.1"
                    min="30"
                    max="45"
                  />
                </div>

                {/* Saturación de Oxígeno */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Saturación O₂ (%)
                  </label>
                  <input
                    type="number"
                    name="saturacion_oxigeno"
                    value={datosCliente.saturacion_oxigeno}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="98"
                    min="70"
                    max="100"
                  />
                </div>

                {/* Ritmo Cardíaco */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ritmo Cardíaco (bpm)
                  </label>
                  <input
                    type="number"
                    name="ritmo_cardiaco"
                    value={datosCliente.ritmo_cardiaco}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="70"
                    min="30"
                    max="220"
                  />
                </div>

                {/* Presión Arterial */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Presión Arterial
                  </label>
                  <input
                    type="text"
                    name="presion_arterial"
                    value={datosCliente.presion_arterial}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="120/80"
                  />
                </div>
              </div>
            </div>

            {/* Antecedentes Médicos */}
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Antecedentes Médicos</h3>
                  <p className="text-sm text-gray-600">Historial médico relevante</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checkboxes de antecedentes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="presion_alta"
                      checked={datosCliente.presion_alta}
                      onChange={manejarCambio}
                      className="w-5 h-5 text-[#095a6d] bg-gray-100 border-gray-300 rounded focus:ring-[#095a6d]/20 focus:ring-2"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Presión Arterial Alta
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="diabetes"
                      checked={datosCliente.diabetes}
                      onChange={manejarCambio}
                      className="w-5 h-5 text-[#095a6d] bg-gray-100 border-gray-300 rounded focus:ring-[#095a6d]/20 focus:ring-2"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Diabetes
                    </label>
                  </div>
                </div>

                {/* Alergias */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Alergias
                  </label>
                  <textarea
                    name="alergias"
                    value={datosCliente.alergias}
                    onChange={manejarCambio}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 resize-none"
                    placeholder="Describa alergias conocidas..."
                  />
                </div>

                {/* Notas Extras */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Notas Extras
                  </label>
                  <textarea
                    name="notas_extras"
                    value={datosCliente.notas_extras}
                    onChange={manejarCambio}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#095a6d] focus:ring-[#095a6d]/20 focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 resize-none"
                    placeholder="Información adicional relevante..."
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  href="/clientes"
                  className="px-8 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={cargando}
                  className={`px-8 py-3 bg-gradient-to-r from-[#095a6d] to-[#0a4a5c] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                    cargando ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                  }`}
                >
                  {cargando ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{clienteId ? "Actualizando..." : "Registrando..."}</span>
                    </div>
                  ) : (
                    clienteId ? "Actualizar Cliente" : "Registrar Cliente"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}