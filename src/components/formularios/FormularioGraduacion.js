"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FormularioGraduacion({
  clienteId,
  graduacionExistente = null,
  tipoInicial = "lejos",
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cliente, setCliente] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");

  // ARREGLO: Estado actual del tipo seleccionado
  const [tipoActual, setTipoActual] = useState(tipoInicial);

  // ARREGLO: Estados separados para cada tipo de graduación
  const [datosLejos, setDatosLejos] = useState({
    tipo: "lejos",
    od_esfera: "",
    od_cilindro: "",
    od_eje: "",
    od_adicion: "",
    oi_esfera: "",
    oi_cilindro: "",
    oi_eje: "",
    oi_adicion: "",
    fecha_examen: new Date().toISOString().split("T")[0],
    notas: "",
  });

  const [datosCerca, setDatosCerca] = useState({
    tipo: "cerca",
    od_esfera: "",
    od_cilindro: "",
    od_eje: "",
    od_adicion: "",
    oi_esfera: "",
    oi_cilindro: "",
    oi_eje: "",
    oi_adicion: "",
    fecha_examen: new Date().toISOString().split("T")[0],
    notas: "",
  });

  // ARREGLO: Función para obtener el estado actual según el tipo
  const obtenerDatosActuales = () => {
    return tipoActual === "lejos" ? datosLejos : datosCerca;
  };

  // ARREGLO: Función para actualizar el estado correcto según el tipo
  const actualizarDatos = (nuevos_datos) => {
    if (tipoActual === "lejos") {
      setDatosLejos((prev) => ({ ...prev, ...nuevos_datos }));
    } else {
      setDatosCerca((prev) => ({ ...prev, ...nuevos_datos }));
    }
  };

  // Cargar datos del cliente al montar
  useEffect(() => {
    if (clienteId) {
      cargarCliente();
    }

    // Si hay graduación existente, cargar datos en el estado correcto
    if (graduacionExistente) {
      const datosExistentes = {
        tipo: graduacionExistente.tipo || "lejos",
        od_esfera: graduacionExistente.od_esfera || "",
        od_cilindro: graduacionExistente.od_cilindro || "",
        od_eje: graduacionExistente.od_eje || "",
        od_adicion: graduacionExistente.od_adicion || "",
        oi_esfera: graduacionExistente.oi_esfera || "",
        oi_cilindro: graduacionExistente.oi_cilindro || "",
        oi_eje: graduacionExistente.oi_eje || "",
        oi_adicion: graduacionExistente.oi_adicion || "",
        fecha_examen:
          graduacionExistente.fecha_examen ||
          new Date().toISOString().split("T")[0],
        notas: graduacionExistente.notas || "",
      };

      // Cargar en el estado correspondiente
      if (graduacionExistente.tipo === "lejos") {
        setDatosLejos(datosExistentes);
      } else {
        setDatosCerca(datosExistentes);
      }

      setTipoActual(graduacionExistente.tipo || "lejos");
    }
  }, [clienteId, graduacionExistente]);

  const cargarCliente = async () => {
    try {
      setCargando(true);
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setCliente(datos.cliente);
      } else {
        setMensaje("Error cargando información del cliente");
      }
    } catch (error) {
      setMensaje("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  // ARREGLO: Función para cambiar tipo de graduación
  const cambiarTipo = (nuevoTipo) => {
    setTipoActual(nuevoTipo);
    setErrores({}); // Limpiar errores al cambiar tipo
    setMensaje(""); // Limpiar mensajes al cambiar tipo
  };

  // ARREGLO: Función para manejar cambios en los campos
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    if (name === "tipo") {
      cambiarTipo(value);
    } else {
      actualizarDatos({ [name]: value });
    }
  };

  const manejarArchivoImagen = (evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      // Validar tipo de archivo
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(archivo.type)) {
        setMensaje("Solo se permiten archivos JPG, JPEG o PNG");
        return;
      }

      // Validar tamaño (5MB máximo)
      if (archivo.size > 5 * 1024 * 1024) {
        setMensaje("El archivo debe ser menor a 5MB");
        return;
      }

      setArchivoImagen(archivo);

      // Crear vista previa
      const lector = new FileReader();
      lector.onload = (e) => {
        setVistaPrevia(e.target.result);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const validarFormulario = () => {
    const datosActuales = obtenerDatosActuales();
    const nuevosErrores = {};

    // Validar que al menos un campo de graduación esté lleno
    const camposGraduacion = [
      datosActuales.od_esfera,
      datosActuales.od_cilindro,
      datosActuales.oi_esfera,
      datosActuales.oi_cilindro,
    ];

    if (camposGraduacion.every((campo) => !campo || campo.trim() === "")) {
      nuevosErrores.general = "Debe ingresar al menos un valor de graduación";
    }

    // Validar rangos de esfera (-20.00 a +20.00)
    if (
      datosActuales.od_esfera &&
      (parseFloat(datosActuales.od_esfera) < -20 ||
        parseFloat(datosActuales.od_esfera) > 20)
    ) {
      nuevosErrores.od_esfera = "Esfera OD debe estar entre -20.00 y +20.00";
    }

    if (
      datosActuales.oi_esfera &&
      (parseFloat(datosActuales.oi_esfera) < -20 ||
        parseFloat(datosActuales.oi_esfera) > 20)
    ) {
      nuevosErrores.oi_esfera = "Esfera OI debe estar entre -20.00 y +20.00";
    }

    // Validar cilindro (-6.00 a 0.00)
    if (
      datosActuales.od_cilindro &&
      (parseFloat(datosActuales.od_cilindro) < -6 ||
        parseFloat(datosActuales.od_cilindro) > 0)
    ) {
      nuevosErrores.od_cilindro = "Cilindro OD debe estar entre -6.00 y 0.00";
    }

    if (
      datosActuales.oi_cilindro &&
      (parseFloat(datosActuales.oi_cilindro) < -6 ||
        parseFloat(datosActuales.oi_cilindro) > 0)
    ) {
      nuevosErrores.oi_cilindro = "Cilindro OI debe estar entre -6.00 y 0.00";
    }

    // Validar eje (0-180)
    if (
      datosActuales.od_eje &&
      (parseInt(datosActuales.od_eje) < 0 ||
        parseInt(datosActuales.od_eje) > 180)
    ) {
      nuevosErrores.od_eje = "Eje OD debe estar entre 0 y 180";
    }

    if (
      datosActuales.oi_eje &&
      (parseInt(datosActuales.oi_eje) < 0 ||
        parseInt(datosActuales.oi_eje) > 180)
    ) {
      nuevosErrores.oi_eje = "Eje OI debe estar entre 0 y 180";
    }

    // Validar adición
    if (
      datosActuales.od_adicion &&
      (parseFloat(datosActuales.od_adicion) < 0 ||
        parseFloat(datosActuales.od_adicion) > 5)
    ) {
      nuevosErrores.od_adicion = "Adición OD debe estar entre 0.00 y +5.00";
    }

    if (
      datosActuales.oi_adicion &&
      (parseFloat(datosActuales.oi_adicion) < 0 ||
        parseFloat(datosActuales.oi_adicion) > 5)
    ) {
      nuevosErrores.oi_adicion = "Adición OI debe estar entre 0.00 y +5.00";
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
      const datosActuales = obtenerDatosActuales();

      // Agregar datos de graduación
      Object.keys(datosActuales).forEach((key) => {
        if (datosActuales[key] !== "") {
          formData.append(key, datosActuales[key]);
        }
      });

      // Agregar cliente_id
      formData.append("cliente_id", clienteId);

      // Agregar archivo si existe
      if (archivoImagen) {
        formData.append("imagen_resultado", archivoImagen);
      }

      const url = graduacionExistente
        ? `/api/graduaciones?id=${graduacionExistente.id}`
        : "/api/graduaciones";

      const metodo = graduacionExistente ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        credentials: "include",
        body: formData,
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setMensaje(
          graduacionExistente
            ? "Graduación actualizada exitosamente"
            : "Graduación guardada exitosamente"
        );

        setTimeout(() => {
          router.push(`/clientes/${clienteId}/graduacion`);
        }, 1500);
      } else {
        const errorData = await respuesta.json();
        setMensaje(errorData.error || "Error guardando graduación");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  // Obtener datos actuales para el render
  const datosGraduacion = obtenerDatosActuales();

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
              <div className="flex flex-col">
                <span className="font-bold text-[#095a6d] text-lg">
                  Visión Allende
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Sistema de Gestión
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-4 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#095a6d] transition-colors">
            Inicio
          </Link>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <Link
            href="/clientes"
            className="hover:text-[#095a6d] transition-colors"
          >
            Clientes
          </Link>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <Link
            href={`/clientes/${clienteId}/graduacion`}
            className="hover:text-[#095a6d] transition-colors"
          >
            Graduaciones
          </Link>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[#095a6d] font-medium">
            {graduacionExistente ? "Editar Graduación" : "Nueva Graduación"}
          </span>
        </nav>

        {/* Encabezado */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
              tipoActual === "lejos"
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-green-500 to-green-600"
            }`}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {tipoActual === "lejos" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              )}
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {graduacionExistente ? "Actualizar Graduación" : "Nueva Graduación"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {graduacionExistente
              ? "Modifica los valores de la graduación existente"
              : `Registre la graduación para ${
                  tipoActual === "lejos" ? "ver de lejos" : "ver de cerca"
                } del cliente`}
          </p>
          {cliente && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200">
              <svg
                className="w-5 h-5 text-[#095a6d] mr-2"
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
              <span className="font-semibold text-gray-900">
                {cliente.nombre_completo}
              </span>
              <span className="text-gray-500 ml-2">
                • Exp: {cliente.expediente}
              </span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={enviarFormulario} className="p-8 space-y-8">
            {/* Tipo de Graduación */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg
                  className="w-8 h-8 text-[#095a6d] mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Tipo de Graduación
                <span className="text-base font-normal text-gray-500 ml-3">
                  Seleccione el tipo de examen realizado
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label
                  className={`flex-1 cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                    tipoActual === "lejos"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="lejos"
                    checked={tipoActual === "lejos"}
                    onChange={manejarCambio}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                        tipoActual === "lejos"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ver de Lejos
                      </h3>
                      <p className="text-sm text-gray-600">
                        Graduación para distancia lejana
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex-1 cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                    tipoActual === "cerca"
                      ? "border-green-500 bg-green-50 ring-2 ring-green-500/20"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="cerca"
                    checked={tipoActual === "cerca"}
                    onChange={manejarCambio}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                        tipoActual === "cerca"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ver de Cerca
                      </h3>
                      <p className="text-sm text-gray-600">
                        Graduación para distancia cercana
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Mediciones Ópticas */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg
                  className="w-8 h-8 text-[#095a6d] mr-3"
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
                Mediciones Ópticas
                <span className="text-base font-normal text-gray-500 ml-3">
                  Valores de graduación para cada ojo
                </span>
              </h2>

              {errores.general && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 font-medium">{errores.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ojo Derecho */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">OD</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Ojo Derecho
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mediciones del ojo derecho
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Esfera
                      </label>
                      <input
                        type="number"
                        name="od_esfera"
                        value={datosGraduacion.od_esfera}
                        onChange={manejarCambio}
                        step="0.25"
                        min="-20"
                        max="20"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.od_esfera
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                        placeholder="-2.00"
                      />
                      {errores.od_esfera && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.od_esfera}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cilindro
                      </label>
                      <input
                        type="number"
                        name="od_cilindro"
                        value={datosGraduacion.od_cilindro}
                        onChange={manejarCambio}
                        step="0.25"
                        min="-6"
                        max="0"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.od_cilindro
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                        placeholder="-0.50"
                      />
                      {errores.od_cilindro && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.od_cilindro}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Eje
                      </label>
                      <input
                        type="number"
                        name="od_eje"
                        value={datosGraduacion.od_eje}
                        onChange={manejarCambio}
                        min="0"
                        max="180"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.od_eje
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                        placeholder="180"
                      />
                      {errores.od_eje && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.od_eje}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Adición
                      </label>
                      <input
                        type="number"
                        name="od_adicion"
                        value={datosGraduacion.od_adicion}
                        onChange={manejarCambio}
                        step="0.25"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.od_adicion
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                        placeholder="0"
                      />
                      {errores.od_adicion && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.od_adicion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ojo Izquierdo */}
                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">OI</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Ojo Izquierdo
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mediciones del ojo izquierdo
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Esfera
                      </label>
                      <input
                        type="number"
                        name="oi_esfera"
                        value={datosGraduacion.oi_esfera}
                        onChange={manejarCambio}
                        step="0.25"
                        min="-20"
                        max="20"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.oi_esfera
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        }`}
                        placeholder="-1.75"
                      />
                      {errores.oi_esfera && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.oi_esfera}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cilindro
                      </label>
                      <input
                        type="number"
                        name="oi_cilindro"
                        value={datosGraduacion.oi_cilindro}
                        onChange={manejarCambio}
                        step="0.25"
                        min="-6"
                        max="0"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.oi_cilindro
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        }`}
                        placeholder="-0.75"
                      />
                      {errores.oi_cilindro && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.oi_cilindro}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Eje
                      </label>
                      <input
                        type="number"
                        name="oi_eje"
                        value={datosGraduacion.oi_eje}
                        onChange={manejarCambio}
                        min="0"
                        max="180"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.oi_eje
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        }`}
                        placeholder="170"
                      />
                      {errores.oi_eje && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.oi_eje}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Adición
                      </label>
                      <input
                        type="number"
                        name="oi_adicion"
                        value={datosGraduacion.oi_adicion}
                        onChange={manejarCambio}
                        step="0.25"
                        min="0"
                        max="5"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errores.oi_adicion
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-gray-300 bg-white/70 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        }`}
                        placeholder="0"
                      />
                      {errores.oi_adicion && (
                        <p className="text-red-600 text-sm mt-1">
                          {errores.oi_adicion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subir Imagen */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 text-[#095a6d] mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Imagen de Resultados (Opcional)
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={manejarArchivoImagen}
                  className="sr-only"
                  id="archivo-imagen"
                />
                <label
                  htmlFor="archivo-imagen"
                  className="cursor-pointer block"
                >
                  {vistaPrevia ? (
                    <div className="space-y-4">
                      <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-gray-600">
                        Clic para cambiar imagen
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-900">
                          Subir imagen del autorefractor
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, JPEG o PNG hasta 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha del Examen
                </label>
                <input
                  type="date"
                  name="fecha_examen"
                  value={datosGraduacion.fecha_examen}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:border-[#095a6d] focus:ring-2 focus:ring-[#095a6d]/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  name="notas"
                  value={datosGraduacion.notas}
                  onChange={manejarCambio}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:border-[#095a6d] focus:ring-2 focus:ring-[#095a6d]/20 transition-all duration-200 resize-none"
                  placeholder="Observaciones especiales sobre la graduación..."
                />
              </div>
            </div>

            {/* Mensaje de estado */}
            {mensaje && (
              <div
                className={`p-4 rounded-xl ${
                  mensaje.includes("Error")
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}
              >
                <p className="font-medium">{mensaje}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link
                href={`/clientes/${clienteId}/graduacion`}
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={cargando}
                className="flex-2 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] text-white font-semibold rounded-xl hover:from-[#073d4a] hover:to-[#0a3b50] focus:ring-4 focus:ring-[#095a6d]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {graduacionExistente ? "Actualizando..." : "Registrando..."}
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
                    {graduacionExistente
                      ? "Actualizar Graduación"
                      : "Guardar Graduación"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
