import { NextResponse } from "next/server";
import { ejecutarConsulta } from "@/lib/conexion-bd";

// GET - Obtener venta por ID con información completa
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de venta requerido" },
        { status: 400 }
      );
    }

    // Obtener datos completos de la venta
    const consultaVenta = `
      SELECT 
        v.*,
        c.nombre_completo as cliente_nombre,
        c.expediente as cliente_expediente,
        c.email as cliente_email,
        c.celular as cliente_celular,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        p.nombre as periodo_nombre,
        p.fecha_inicio as periodo_inicio,
        p.fecha_fin as periodo_fin
      FROM ventas v
      INNER JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN periodos_contables p ON v.periodo_id = p.id
      WHERE v.id = $1
    `;

    const resultadoVenta = await ejecutarConsulta(consultaVenta, [id]);

    if (resultadoVenta.rows.length === 0) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const venta = resultadoVenta.rows[0];

    // Obtener graduaciones del cliente
    const consultaGraduaciones = `
      SELECT * FROM graduaciones 
      WHERE cliente_id = $1 
      ORDER BY tipo, fecha_examen DESC
    `;
    const resultadoGraduaciones = await ejecutarConsulta(consultaGraduaciones, [
      venta.cliente_id,
    ]);

    // Obtener historial de depósitos
    const consultaDepositos = `
      SELECT 
        d.*,
        TO_CHAR(d.fecha_deposito, 'DD/MM/YYYY') as fecha_deposito_formato,
        TO_CHAR(d.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_registro_formato
      FROM depositos d 
      WHERE d.venta_id = $1 
      ORDER BY d.fecha_deposito DESC, d.fecha_creacion DESC
    `;
    const resultadoDepositos = await ejecutarConsulta(consultaDepositos, [id]);

    // Calcular estadísticas de la venta
    const estadisticasVenta = {
      total_depositos: resultadoDepositos.rows.length,
      total_depositado_real: resultadoDepositos.rows.reduce(
        (total, deposito) => total + parseFloat(deposito.monto || 0),
        0
      ),
      saldo_calculado:
        parseFloat(venta.costo_total) -
        resultadoDepositos.rows.reduce(
          (total, deposito) => total + parseFloat(deposito.monto || 0),
          0
        ),
      porcentaje_pagado:
        parseFloat(venta.costo_total) > 0
          ? (resultadoDepositos.rows.reduce(
              (total, deposito) => total + parseFloat(deposito.monto || 0),
              0
            ) /
              parseFloat(venta.costo_total)) *
            100
          : 0,
    };

    // Obtener otras ventas del mismo cliente (últimas 5)
    const consultaOtrasVentas = `
      SELECT 
        id, numero_venta, costo_total, estado, fecha_venta,
        TO_CHAR(fecha_venta, 'DD/MM/YYYY') as fecha_venta_formato
      FROM ventas 
      WHERE cliente_id = $1 AND id != $2
      ORDER BY fecha_venta DESC 
      LIMIT 5
    `;
    const resultadoOtrasVentas = await ejecutarConsulta(consultaOtrasVentas, [
      venta.cliente_id,
      id,
    ]);

    return NextResponse.json({
      venta,
      graduaciones: resultadoGraduaciones.rows,
      depositos: resultadoDepositos.rows,
      estadisticas: estadisticasVenta,
      otras_ventas: resultadoOtrasVentas.rows,
    });
  } catch (error) {
    console.error("Error obteniendo venta:", error);
    return NextResponse.json(
      { error: "Error obteniendo información de la venta" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar venta específica
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const datosOriginales = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de venta requerido" },
        { status: 400 }
      );
    }

    // Verificar que la venta existe
    const verificarVenta = await ejecutarConsulta(
      "SELECT id FROM ventas WHERE id = $1",
      [id]
    );

    if (verificarVenta.rows.length === 0) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar venta
    const consultaActualizar = `
      UPDATE ventas SET
        marca_armazon = $2,
        laboratorio = $3,
        precio_armazon = $4,
        precio_micas = $5,
        costo_total = $6,
        imagen_receta = $7,
        estado = $8,
        fecha_llegada_laboratorio = $9,
        fecha_entrega_cliente = $10,
        notas = $11,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const parametros = [
      id,
      datosOriginales.marca_armazon || null,
      datosOriginales.laboratorio || null,
      datosOriginales.precio_armazon
        ? parseFloat(datosOriginales.precio_armazon)
        : null,
      datosOriginales.precio_micas
        ? parseFloat(datosOriginales.precio_micas)
        : null,
      parseFloat(datosOriginales.costo_total),
      datosOriginales.imagen_receta || null,
      datosOriginales.estado || "pendiente",
      datosOriginales.fecha_llegada_laboratorio || null,
      datosOriginales.fecha_entrega_cliente || null,
      datosOriginales.notas || null,
    ];

    const resultado = await ejecutarConsulta(consultaActualizar, parametros);

    // Recalcular saldo restante basado en depósitos existentes
    const consultaRecalcular = `
      UPDATE ventas 
      SET 
        total_depositado = (
          SELECT COALESCE(SUM(monto), 0) 
          FROM depositos 
          WHERE venta_id = $1
        ),
        saldo_restante = costo_total - (
          SELECT COALESCE(SUM(monto), 0) 
          FROM depositos 
          WHERE venta_id = $1
        )
      WHERE id = $1
      RETURNING *
    `;

    const ventaActualizada = await ejecutarConsulta(consultaRecalcular, [id]);

    return NextResponse.json({
      mensaje: "Venta actualizada exitosamente",
      venta: ventaActualizada.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando venta:", error);
    return NextResponse.json(
      { error: "Error actualizando venta" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar venta específica
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de venta requerido" },
        { status: 400 }
      );
    }

    // Verificar que la venta exists y obtener información
    const verificarVenta = await ejecutarConsulta(
      "SELECT id, numero_venta, estado, total_depositado FROM ventas WHERE id = $1",
      [id]
    );

    if (verificarVenta.rows.length === 0) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const venta = verificarVenta.rows[0];

    // Verificar si se puede eliminar
    if (venta.estado === "entregado") {
      return NextResponse.json(
        {
          error: "No se puede eliminar una venta ya entregada",
          sugerencia: 'Cambie el estado a "cancelado" en su lugar',
        },
        { status: 409 }
      );
    }

    if (parseFloat(venta.total_depositado) > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar una venta con depósitos registrados",
          sugerencia:
            'Elimine primero todos los depósitos o cambie el estado a "cancelado"',
        },
        { status: 409 }
      );
    }

    // Eliminar venta (esto eliminará en cascada los depósitos si los hay)
    await ejecutarConsulta("DELETE FROM ventas WHERE id = $1", [id]);

    return NextResponse.json({
      mensaje: "Venta eliminada exitosamente",
      numero_venta: venta.numero_venta,
    });
  } catch (error) {
    console.error("Error eliminando venta:", error);
    return NextResponse.json(
      { error: "Error eliminando venta" },
      { status: 500 }
    );
  }
}
