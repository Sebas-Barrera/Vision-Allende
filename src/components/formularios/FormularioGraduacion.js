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

  // Estado del formulario de graduación
  const [datosGraduacion, setDatosGraduacion] = useState({
    tipo: tipoInicial, // Usar el tipo inicial pasado como prop

    // Ojo Derecho (OD)
    od_esfera: "",
    od_cilindro: "",
    od_eje: "",
    od_adicion: "",

    // Ojo Izquierdo (OI)
    oi_esfera: "",
    oi_cilindro: "",
    oi_eje: "",
    oi_adicion: "",

    // Metadatos
    fecha_examen: new Date().toISOString().split("T")[0],
    notas: "",
  });

  // Cargar datos del cliente al montar
  useEffect(() => {
    if (clienteId) {
      cargarCliente();
    }

    // Si hay graduación existente, cargar datos
    if (graduacionExistente) {
      setDatosGraduacion({
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
          graduacionExistente.fecha_examen?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        notas: graduacionExistente.notas || "",
      });

      // Cargar imagen existente si existe
      if (graduacionExistente.imagen_resultado) {
        setVistaPrevia(`/uploads/${graduacionExistente.imagen_resultado}`);
      }
    }
  }, [clienteId, graduacionExistente]);

  const cargarCliente = async () => {
    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
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

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatosGraduacion((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const manejarArchivoImagen = (evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      // Validar tamaño del archivo (máximo 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        setErrores((prev) => ({
          ...prev,
          imagen: "El archivo no debe exceder 10MB",
        }));
        return;
      }

      // Validar tipo de archivo
      const tiposPermitidos = ["image/jpeg", "image/png", "image/jpg"];
      if (!tiposPermitidos.includes(archivo.type)) {
        setErrores((prev) => ({
          ...prev,
          imagen: "Solo se permiten imágenes JPEG y PNG",
        }));
        return;
      }

      setArchivoImagen(archivo);

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setVistaPrevia(e.target.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar rangos de esfera
    if (
      datosGraduacion.od_esfera &&
      (parseFloat(datosGraduacion.od_esfera) < -30 ||
        parseFloat(datosGraduacion.od_esfera) > 30)
    ) {
      nuevosErrores.od_esfera = "Esfera OD debe estar entre -30.00 y +30.00";
    }

    if (
      datosGraduacion.oi_esfera &&
      (parseFloat(datosGraduacion.oi_esfera) < -30 ||
        parseFloat(datosGraduacion.oi_esfera) > 30)
    ) {
      nuevosErrores.oi_esfera = "Esfera OI debe estar entre -30.00 y +30.00";
    }

    // Validar rangos de cilindro
    if (
      datosGraduacion.od_cilindro &&
      (parseFloat(datosGraduacion.od_cilindro) < -10 ||
        parseFloat(datosGraduacion.od_cilindro) > 10)
    ) {
      nuevosErrores.od_cilindro =
        "Cilindro OD debe estar entre -10.00 y +10.00";
    }

    if (
      datosGraduacion.oi_cilindro &&
      (parseFloat(datosGraduacion.oi_cilindro) < -10 ||
        parseFloat(datosGraduacion.oi_cilindro) > 10)
    ) {
      nuevosErrores.oi_cilindro =
        "Cilindro OI debe estar entre -10.00 y +10.00";
    }

    // Validar eje (0-180)
    if (
      datosGraduacion.od_eje &&
      (parseInt(datosGraduacion.od_eje) < 0 ||
        parseInt(datosGraduacion.od_eje) > 180)
    ) {
      nuevosErrores.od_eje = "Eje OD debe estar entre 0 y 180";
    }

    if (
      datosGraduacion.oi_eje &&
      (parseInt(datosGraduacion.oi_eje) < 0 ||
        parseInt(datosGraduacion.oi_eje) > 180)
    ) {
      nuevosErrores.oi_eje = "Eje OI debe estar entre 0 y 180";
    }

    // Validar adición
    if (
      datosGraduacion.od_adicion &&
      (parseFloat(datosGraduacion.od_adicion) < 0 ||
        parseFloat(datosGraduacion.od_adicion) > 5)
    ) {
      nuevosErrores.od_adicion = "Adición OD debe estar entre 0.00 y +5.00";
    }

    if (
      datosGraduacion.oi_adicion &&
      (parseFloat(datosGraduacion.oi_adicion) < 0 ||
        parseFloat(datosGraduacion.oi_adicion) > 5)
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

      // Agregar datos de graduación
      Object.keys(datosGraduacion).forEach((key) => {
        if (datosGraduacion[key] !== "") {
          formData.append(key, datosGraduacion[key]);
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
          <Link
            href={`/clientes/${clienteId}`}
            className="hover:text-[#095a6d]"
          >
            {cliente?.nombre_completo || "Cliente"}
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
            {graduacionExistente ? "Editar Graduación" : "Nueva Graduación"}
          </span>
        </nav>

        {/* Encabezado */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
              datosGraduacion.tipo === "lejos"
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
              {datosGraduacion.tipo === "lejos" ? (
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
                  datosGraduacion.tipo === "lejos"
                    ? "ver de lejos"
                    : "ver de cerca"
                }`}
          </p>
          {cliente && (
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d]/10 to-blue-50 rounded-2xl">
              <svg
                className="w-5 h-5 mr-2 text-[#095a6d]"
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
              <span className="text-lg font-semibold text-gray-900">
                {cliente.nombre_completo}
              </span>
            </div>
          )}
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
          {/* Tipo de Graduación */}
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tipo de Graduación
                </h2>
                <p className="text-gray-600">
                  Seleccione el tipo de examen realizado
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <label
                className={`flex-1 cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                  datosGraduacion.tipo === "lejos"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="lejos"
                  checked={datosGraduacion.tipo === "lejos"}
                  onChange={manejarCambio}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                      datosGraduacion.tipo === "lejos"
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
                  datosGraduacion.tipo === "cerca"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value="cerca"
                  checked={datosGraduacion.tipo === "cerca"}
                  onChange={manejarCambio}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                      datosGraduacion.tipo === "cerca"
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
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Mediciones Ópticas
                </h2>
                <p className="text-gray-600">
                  Valores de graduación para cada ojo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ojo Derecho */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">OD</span>
                  </div>
                  <div>
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
                      step="0.25"
                      name="od_esfera"
                      value={datosGraduacion.od_esfera}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errores.od_esfera
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+/-0.00"
                    />
                    {errores.od_esfera && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      step="0.25"
                      name="od_cilindro"
                      value={datosGraduacion.od_cilindro}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errores.od_cilindro
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+/-0.00"
                    />
                    {errores.od_cilindro && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      min="0"
                      max="180"
                      name="od_eje"
                      value={datosGraduacion.od_eje}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errores.od_eje
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="0-180°"
                    />
                    {errores.od_eje && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      step="0.25"
                      min="0"
                      max="5"
                      name="od_adicion"
                      value={datosGraduacion.od_adicion}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errores.od_adicion
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+0.00"
                    />
                    {errores.od_adicion && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                        {errores.od_adicion}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ojo Izquierdo */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">OI</span>
                  </div>
                  <div>
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
                      step="0.25"
                      name="oi_esfera"
                      value={datosGraduacion.oi_esfera}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                        errores.oi_esfera
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+/-0.00"
                    />
                    {errores.oi_esfera && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      step="0.25"
                      name="oi_cilindro"
                      value={datosGraduacion.oi_cilindro}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                        errores.oi_cilindro
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+/-0.00"
                    />
                    {errores.oi_cilindro && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      min="0"
                      max="180"
                      name="oi_eje"
                      value={datosGraduacion.oi_eje}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                        errores.oi_eje
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="0-180°"
                    />
                    {errores.oi_eje && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                      step="0.25"
                      min="0"
                      max="5"
                      name="oi_adicion"
                      value={datosGraduacion.oi_adicion}
                      onChange={manejarCambio}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                        errores.oi_adicion
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white/70"
                      }`}
                      placeholder="+0.00"
                    />
                    {errores.oi_adicion && (
                      <p className="text-red-600 text-xs mt-1 flex items-center">
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
                        {errores.oi_adicion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen de Resultados */}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Imagen de Resultados
                </h2>
                <p className="text-gray-600">
                  Subir imagen del autorefractómetro (opcional)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Archivo de Imagen
              </label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-[#095a6d] transition-colors">
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
                      htmlFor="imagen-resultado"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#095a6d] hover:text-[#073d4a] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#095a6d]"
                    >
                      <span>Subir una imagen</span>
                      <input
                        id="imagen-resultado"
                        name="imagen-resultado"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={manejarArchivoImagen}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                </div>
              </div>

              {errores.imagen && (
                <p className="text-red-600 text-sm flex items-center">
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
                  {errores.imagen}
                </p>
              )}

              {vistaPrevia && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Vista previa
                  </h4>
                  <div className="max-w-xs mx-auto">
                    <img
                      src={vistaPrevia}
                      alt="Vista previa de resultados"
                      className="w-full border rounded-xl shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Información Adicional
                </h2>
                <p className="text-gray-600">
                  Fecha del examen y notas complementarias
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha del Examen
                </label>
                <input
                  type="date"
                  name="fecha_examen"
                  value={datosGraduacion.fecha_examen}
                  onChange={manejarCambio}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas del Examen
                </label>
                <textarea
                  name="notas"
                  value={datosGraduacion.notas}
                  onChange={manejarCambio}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#095a6d]/20 focus:border-[#095a6d] transition-all duration-200 bg-white/70 resize-none"
                  placeholder="Observaciones especiales, condiciones del examen, etc..."
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              href={`/clientes/${clienteId}/graduacion`}
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
                  {graduacionExistente ? "Actualizando..." : "Guardando..."}
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
      </main>
    </div>
  );
}
