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

    // 5. Obtener estadísticas del periodo activo
    const resultadoPeriodoActivo = await ejecutarConsulta(`
      SELECT
        p.id,
        p.nombre,
        p.fecha_inicio,
        p.fecha_fin,
        COUNT(v.id) as cantidad_ventas,
        COALESCE(SUM(v.costo_total), 0) as total_vendido,
        COALESCE(SUM(v.total_depositado), 0) as total_cobrado,
        COALESCE(SUM(v.saldo_restante), 0) as total_pendiente,
        COUNT(CASE WHEN v.saldo_restante > 0 THEN 1 END) as ventas_con_deuda
      FROM periodos_contables p
      LEFT JOIN ventas v ON v.periodo_id = p.id
      WHERE p.activo = true
      GROUP BY p.id
    `);

    const periodoActivo = resultadoPeriodoActivo.rows[0] || {
      nombre: 'Sin periodo activo',
      cantidad_ventas: 0,
      total_vendido: 0,
      total_cobrado: 0,
      total_pendiente: 0,
      ventas_con_deuda: 0
    };

    // 6. Obtener deudas históricas de periodos cerrados
    const resultadoDeudasHistoricas = await ejecutarConsulta(`
      SELECT
        COUNT(*) as total_deudas,
        COALESCE(SUM(saldo_pendiente), 0) as total_deuda_historica
      FROM deudas_periodos
      WHERE saldo_pendiente > 0
    `);

    const deudasHistoricas = resultadoDeudasHistoricas.rows[0] || {
      total_deudas: 0,
      total_deuda_historica: 0
    };

    const respuesta = {
      estadisticas_generales: {
        clientes: totalClientes,
        ventas: totalVentas,
        pendientes: ventasPendientes,
        ingresos: ingresosTotales,
      },
      periodo_activo: {
        nombre: periodoActivo.nombre,
        fecha_inicio: periodoActivo.fecha_inicio,
        fecha_fin: periodoActivo.fecha_fin,
        cantidad_ventas: parseInt(periodoActivo.cantidad_ventas || 0),
        total_vendido: parseFloat(periodoActivo.total_vendido || 0),
        total_cobrado: parseFloat(periodoActivo.total_cobrado || 0),
        total_pendiente: parseFloat(periodoActivo.total_pendiente || 0),
        ventas_con_deuda: parseInt(periodoActivo.ventas_con_deuda || 0),
        porcentaje_cobrado: periodoActivo.total_vendido > 0
          ? ((periodoActivo.total_cobrado / periodoActivo.total_vendido) * 100).toFixed(2)
          : 0
      },
      deudas_historicas: {
        cantidad: parseInt(deudasHistoricas.total_deudas || 0),
        total: parseFloat(deudasHistoricas.total_deuda_historica || 0)
      },
      fecha_actualizacion: new Date().toISOString(),
    };

    console.log("✅ Estadísticas obtenidas exitosamente");

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
