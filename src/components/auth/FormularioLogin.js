"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormularioLogin() {
  const [datosLogin, setDatosLogin] = useState({
    nombreUsuario: "",
    password: "",
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const router = useRouter();

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatosLogin((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: ""
      }));
    }

    // Limpiar error general
    if (error) {
      setError("");
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosLogin.nombreUsuario.trim()) {
      nuevosErrores.nombreUsuario = "Nombre de usuario es requerido";
    } else if (datosLogin.nombreUsuario.length < 3) {
      nuevosErrores.nombreUsuario = "Debe tener al menos 3 caracteres";
    }

    if (!datosLogin.password) {
      nuevosErrores.password = "Contraseña es requerida";
    } else if (datosLogin.password.length < 6) {
      nuevosErrores.password = "Debe tener al menos 6 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setError("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreUsuario: datosLogin.nombreUsuario,
          password: datosLogin.password,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        console.log("Login exitoso:", datos.mensaje);
        // Agregar delay para asegurar que la cookie se establezca
        setTimeout(() => {
          window.location.href = "/";
        }, 500); // 500ms de delay
      } else {
        // Error en login
        setError(datos.error || "Error en el login");

        // Si es error de credenciales, limpiar contraseña
        if (respuesta.status === 401) {
          setDatosLogin((prev) => ({ ...prev, password: "" }));
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError(
        "Error de conexión. Verifique su internet e intente nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Fondo con patrón sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#095a6d]/5 via-transparent to-[#0c4a6e]/5 pointer-events-none"></div>
      
      {/* Círculos decorativos */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-[#095a6d]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        {/* Contenedor principal */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 relative overflow-hidden">
          {/* Efecto de luz en la parte superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          
          {/* Encabezado con logo */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#095a6d] to-[#0c4a6e] rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Visión Allende
            </h1>
            <p className="text-lg text-gray-600 font-medium mb-1">
              Sistema de Gestión Óptica
            </p>
            <p className="text-sm text-gray-500">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          {/* Mensaje de error general */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl">
              <div className="flex items-center text-red-800">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-6">
            {/* Campo Nombre de Usuario */}
            <div className="space-y-2">
              <label
                htmlFor="nombreUsuario"
                className="block text-sm font-semibold text-gray-700"
              >
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  type="text"
                  autoComplete="username"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/50 border rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errores.nombreUsuario
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-gray-200 focus:ring-[#095a6d]/20 hover:border-gray-300"
                  }`}
                  placeholder="Ingrese su nombre de usuario"
                  value={datosLogin.nombreUsuario}
                  onChange={manejarCambio}
                  disabled={cargando}
                />
              </div>
              {errores.nombreUsuario && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errores.nombreUsuario}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/50 border rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errores.password
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-gray-200 focus:ring-[#095a6d]/20 hover:border-gray-300"
                  }`}
                  placeholder="Ingrese su contraseña"
                  value={datosLogin.password}
                  onChange={manejarCambio}
                  disabled={cargando}
                />
              </div>
              {errores.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errores.password}
                </p>
              )}
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-4 px-6 bg-gradient-to-r from-[#095a6d] to-[#0c4a6e] hover:from-[#073d4a] hover:to-[#0a3b50] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                cargando ? "opacity-70 cursor-not-allowed transform-none" : ""
              }`}
            >
              {cargando ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  <span>Verificando credenciales...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">
                Sistema seguro con autenticación JWT
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Máximo 5 intentos
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sesión 7 días
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con marca */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Visión Allende - Sistema de Gestión Óptica
          </p>
        </div>
      </div>
    </div>
  );
}