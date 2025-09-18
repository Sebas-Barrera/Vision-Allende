"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FormularioGraduacion from "@/components/formularios/FormularioGraduacion";

export default function PaginaGraduacionCliente() {
  const params = useParams();
  const clienteId = params.id;

  const [cliente, setCliente] = useState(null);
  const [graduaciones, setGraduaciones] = useState([]);
  const [graduacionEditando, setGraduacionEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoNuevaGraduacion, setTipoNuevaGraduacion] = useState("lejos");

  useEffect(() => {
    cargarCliente();
    cargarGraduaciones();
  }, [clienteId]);

  const cargarCliente = async () => {
    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setCliente(datos.cliente);
      } else {
        setError("Cliente no encontrado");
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
      setError("Error cargando información del cliente");
    }
  };

  const cargarGraduaciones = async () => {
    try {
      const respuesta = await fetch(`/api/graduaciones?cliente_id=${clienteId}`, {
        credentials: "include",
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setGraduaciones(datos.graduaciones || []);
      }
    } catch (error) {
      console.error("Error cargando graduaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatearGraduacion = (esfera, cilindro, eje, adicion) => {
    const resultado = [];
    if (esfera) resultado.push(`Esf: ${esfera >= 0 ? "+" : ""}${esfera}`);
    if (cilindro) resultado.push(`Cil: ${cilindro >= 0 ? "+" : ""}${cilindro}`);
    if (eje) resultado.push(`Eje: ${eje}°`);
    if (adicion) resultado.push(`Add: +${adicion}`);

    return resultado.length > 0 ? resultado.join(" | ") : "Sin graduación";
  };

  const eliminarGraduacion = async (graduacionId) => {
    if (!confirm("¿Está seguro de eliminar esta graduación?")) {
      return;
    }

    try {
      const respuesta = await fetch(`/api/graduaciones?id=${graduacionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (respuesta.ok) {
        await cargarGraduaciones();
      } else {
        alert("Error eliminando graduación");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#095a6d]/30 border-t-[#095a6d] rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando información</h2>
          <p className="text-gray-600">Obteniendo datos del cliente y graduaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/clientes" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] text-white font-semibold rounded-xl hover:from-[#073d4a] hover:to-[#0a3b50] transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Clientes
          </a>
        </div>
      </div>
    );
  }

  // Mostrar formulario si está editando o creando
  if (mostrarFormulario || graduacionEditando) {
    return (
      <FormularioGraduacion
        clienteId={clienteId}
        graduacionExistente={graduacionEditando}
        tipoInicial={tipoNuevaGraduacion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Visión Allende</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <a href="/clientes" className="text-gray-600 hover:text-[#095a6d] transition-colors">
                Clientes
              </a>
              <a href="/ventas" className="text-gray-600 hover:text-[#095a6d] transition-colors">
                Ventas
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-[#095a6d]">Dashboard</a>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <a href="/clientes" className="hover:text-[#095a6d]">Clientes</a>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <a href={`/clientes/${clienteId}`} className="hover:text-[#095a6d]">
            {cliente?.nombre_completo || "Cliente"}
          </a>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Graduaciones</span>
        </nav>

        {/* Encabezado Principal */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-2xl flex items-center justify-center mr-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Graduaciones del Cliente
                </h1>
                {cliente && (
                  <div>
                    <p className="text-xl text-gray-700 font-medium mb-1">
                      {cliente.nombre_completo}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {cliente.expediente && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Exp: {cliente.expediente}
                        </span>
                      )}
                      {cliente.edad && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {cliente.edad} años
                        </span>
                      )}
                      {cliente.email && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          {cliente.email}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setTipoNuevaGraduacion("lejos");
                  setMostrarFormulario(true);
                  setGraduacionEditando(null);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Graduación de Lejos
              </button>

              <button
                onClick={() => {
                  setTipoNuevaGraduacion("cerca");
                  setMostrarFormulario(true);
                  setGraduacionEditando(null);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Graduación de Cerca
              </button>
            </div>
          </div>

          {/* Estado sin graduaciones */}
          {graduaciones.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sin graduaciones registradas</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                No hay graduaciones registradas para este cliente. Agregue la primera graduación usando los botones superiores.
              </p>
            </div>
          )}
        </div>

        {/* Lista de Graduaciones */}
        {graduaciones.length > 0 && (
          <div className="space-y-6">
            {graduaciones.map((graduacion) => (
              <div key={graduacion.id} className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex items-center mb-4 lg:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        graduacion.tipo === "lejos" 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                          : "bg-gradient-to-br from-green-500 to-green-600"
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {graduacion.tipo === "lejos" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Graduación para {graduacion.tipo === "lejos" ? "Ver de Lejos" : "Ver de Cerca"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(graduacion.fecha_examen).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setGraduacionEditando(graduacion);
                          setMostrarFormulario(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarGraduacion(graduacion.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Datos de Graduación */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    {/* Ojo Derecho */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-800 font-bold text-sm">OD</span>
                        </div>
                        Ojo Derecho
                      </h4>
                      <p className="text-sm text-gray-700 font-mono bg-white/70 rounded-lg p-3">
                        {formatearGraduacion(
                          graduacion.od_esfera,
                          graduacion.od_cilindro,
                          graduacion.od_eje,
                          graduacion.od_adicion
                        )}
                      </p>
                    </div>

                    {/* Ojo Izquierdo */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-800 font-bold text-sm">OI</span>
                        </div>
                        Ojo Izquierdo
                      </h4>
                      <p className="text-sm text-gray-700 font-mono bg-white/70 rounded-lg p-3">
                        {formatearGraduacion(
                          graduacion.oi_esfera,
                          graduacion.oi_cilindro,
                          graduacion.oi_eje,
                          graduacion.oi_adicion
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Imagen de resultados */}
                  {graduacion.imagen_resultado && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Imagen de Resultados
                      </h5>
                      <div className="bg-gray-50 rounded-2xl p-4 max-w-md">
                        <img
                          src={`/uploads/${graduacion.imagen_resultado}`}
                          alt="Resultados del examen"
                          className="w-full border rounded-xl shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {graduacion.notas && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Notas
                      </h5>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{graduacion.notas}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción flotante para móviles */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setTipoNuevaGraduacion("lejos");
                setMostrarFormulario(true);
                setGraduacionEditando(null);
              }}
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Graduación de Lejos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <button
              onClick={() => {
                setTipoNuevaGraduacion("cerca");
                setMostrarFormulario(true);
                setGraduacionEditando(null);
              }}
              className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Graduación de Cerca"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Regresar al Cliente
          </button>
        </div>
      </main>
    </div>
  );
}