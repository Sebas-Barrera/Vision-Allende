"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FormularioVenta from "@/components/formularios/FormularioVenta";

export default function PaginaNuevaVenta() {
  const params = useParams();
  const clienteId = params.id;
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCliente();
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
      setError("Error cargando cliente");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/clientes" className="btn btn-primary">
            Volver a Clientes
          </a>
        </div>
      </div>
    );
  }

  return <FormularioVenta clienteId={clienteId} />;
}
