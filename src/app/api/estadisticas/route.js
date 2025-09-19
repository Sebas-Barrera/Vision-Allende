import { NextResponse } from "next/server";
import { ejecutarConsulta } from "@/lib/conexion-bd";

export async function GET() {
  try {
    console.log("🔍 Iniciando consulta de estadísticas...");

    // 1. Contar clientes
    const resultadoClientes = await ejecutarConsulta(
      "SELECT COUNT(*) as total FROM clientes"
    );
    const totalClientes = parseInt(resultadoClientes.rows[0].total);
    console.log("👥 Total clientes:", totalClientes);

    // 2. Contar ventas
    const resultadoVentas = await ejecutarConsulta(
      "SELECT COUNT(*) as total FROM ventas"
    );
    const totalVentas = parseInt(resultadoVentas.rows[0].total);
    console.log("🛒 Total ventas:", totalVentas);

    // 3. Contar ventas pendientes (saldo > 0)
    const resultadoPendientes = await ejecutarConsulta(
      "SELECT COUNT(*) as total FROM ventas WHERE saldo_restante > 0"
    );
    const ventasPendientes = parseInt(resultadoPendientes.rows[0].total);
    console.log("⏳ Ventas pendientes:", ventasPendientes);

    // 4. Sumar ingresos totales
    const resultadoIngresos = await ejecutarConsulta(
      "SELECT COALESCE(SUM(total_depositado), 0) as total FROM ventas"
    );
    const ingresosTotales = parseFloat(resultadoIngresos.rows[0].total);
    console.log("💰 Ingresos totales:", ingresosTotales);

    const respuesta = {
      estadisticas_generales: {
        clientes: totalClientes,
        ventas: totalVentas,
        pendientes: ventasPendientes,
        ingresos: ingresosTotales,
      },
      estadisticas_por_estado: {},
      estadisticas_mes_actual: {
        ventas: 0,
        monto_vendido: 0,
        ingresos: 0,
      },
      fecha_actualizacion: new Date().toISOString(),
    };

    console.log("✅ Estadísticas obtenidas exitosamente:", respuesta);

    return NextResponse.json({
      mensaje: "Estadísticas obtenidas exitosamente",
      ...respuesta,
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error.message);
    return NextResponse.json(
      { error: "Error obteniendo estadísticas: " + error.message },
      { status: 500 }
    );
  }
}
