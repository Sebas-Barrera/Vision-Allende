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
        [name]: "",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-optica-50 to-optica-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Encabezado */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-optica-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">👓</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-neutral-900">
              Sistema Óptica
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Ingrese sus credenciales para acceder
            </p>
          </div>

          {/* Mensaje de error general */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label
                htmlFor="nombreUsuario"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Nombre de Usuario
              </label>
              <input
                id="nombreUsuario"
                name="nombreUsuario"
                type="text"
                autoComplete="username"
                required
                className={`form-input ${
                  errores.nombreUsuario
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Ingrese su usuario"
                value={datosLogin.nombreUsuario}
                onChange={manejarCambio}
                disabled={cargando}
              />
              {errores.nombreUsuario && (
                <p className="mt-1 text-sm text-red-600">
                  {errores.nombreUsuario}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`form-input ${
                  errores.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Ingrese su contraseña"
                value={datosLogin.password}
                onChange={manejarCambio}
                disabled={cargando}
              />
              {errores.password && (
                <p className="mt-1 text-sm text-red-600">{errores.password}</p>
              )}
            </div>

            {/* Botón Submit */}
            <div>
              <button
                type="submit"
                disabled={cargando}
                className={`w-full btn btn-primary btn-lg ${
                  cargando ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {cargando ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Sistema de gestión interno - Solo personal autorizado
            </p>
          </div>
        </div>

        {/* Información de prueba (solo en desarrollo) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              🔧 Modo Desarrollo
            </h4>
            <p className="text-xs text-yellow-700">
              Usuario: <code className="bg-yellow-100 px-1 rounded">admin</code>
              <br />
              Contraseña:{" "}
              <code className="bg-yellow-100 px-1 rounded">admin123</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
