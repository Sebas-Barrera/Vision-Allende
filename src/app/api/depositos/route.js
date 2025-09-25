import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";
import { validarDeposito, limpiarDatos } from "@/lib/validaciones";
import { parsearDinero, sumarDinero, restarDinero } from "@/lib/dinero-utils";

// GET - Obtener depósitos por venta o todos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ventaId = searchParams.get("venta_id");
    const limite = parseInt(searchParams.get("limite")) || 50;

    let consulta;
    let parametros = [];

    if (ventaId) {
      // Depósitos de una venta específica
      consulta = `
        SELECT 
          d.*,
          v.numero_venta,
          v.costo_total,
          c.nombre_completo as cliente_nombre,
          TO_CHAR(d.fecha_deposito, 'DD/MM/YYYY') as fecha_deposito_formato,
          TO_CHAR(d.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_registro_formato
        FROM depositos d
        INNER JOIN ventas v ON d.venta_id = v.id
        INNER JOIN clientes c ON v.cliente_id = c.id
        WHERE d.venta_id = $1
        ORDER BY d.fecha_deposito DESC, d.fecha_creacion DESC
        LIMIT $2
      `;
      parametros = [ventaId, limite];
    } else {
      // Todos los depósitos recientes
      consulta = `
        SELECT 
          d.*,
          v.numero_venta,
          v.costo_total,
          c.nombre_completo as cliente_nombre,
          TO_CHAR(d.fecha_deposito, 'DD/MM/YYYY') as fecha_deposito_formato,
          TO_CHAR(d.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_registro_formato
        FROM depositos d
        INNER JOIN ventas v ON d.venta_id = v.id
        INNER JOIN clientes c ON v.cliente_id = c.id
        ORDER BY d.fecha_deposito DESC, d.fecha_creacion DESC
        LIMIT $1
      `;
      parametros = [limite];
    }

    const resultado = await ejecutarConsulta(consulta, parametros);

    // Calcular estadísticas si es una venta específica
    let estadisticas = null;
    if (ventaId && resultado.rows.length > 0) {
      const totalDepositado = resultado.rows.reduce(
        (sum, deposito) => sumarDinero(sum, deposito.monto),
        0
      );
      const costoTotal = parseFloat(resultado.rows[0].costo_total);

      estadisticas = {
        total_depositos: resultado.rows.length,
        total_depositado: totalDepositado,
        saldo_restante: costoTotal - totalDepositado,
        porcentaje_pagado:
          costoTotal > 0 ? (totalDepositado / costoTotal) * 100 : 0,
      };
    }

    return NextResponse.json({
      depositos: resultado.rows,
      estadisticas,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error("Error obteniendo depósitos:", error);
    return NextResponse.json(
      { error: "Error obteniendo depósitos: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Registrar nuevo depósito
export async function POST(request) {
  try {
    const datosOriginales = await request.json();

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);

    // Verificar que la venta existe y obtener información
    const consultaVenta = `
      SELECT 
        v.id, v.costo_total, v.total_depositado, v.saldo_restante,
        v.numero_venta, c.nombre_completo as cliente_nombre
      FROM ventas v
      INNER JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = $1
    `;

    const resultadoVenta = await ejecutarConsulta(consultaVenta, [
      datosLimpios.venta_id,
    ]);

    if (resultadoVenta.rows.length === 0) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const venta = resultadoVenta.rows[0];
    const saldoActual = parsearDinero(venta.saldo_restante);
    const montoDeposito = parsearDinero(datosLimpios.monto);

    // Validar depósito
    const validacion = validarDeposito(
      datosLimpios,
      venta.costo_total,
      venta.total_depositado
    );

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
        { status: 400 }
      );
    }

    // Verificar que el depósito no exceda el saldo
    if (montoDeposito > saldoActual) {
      return NextResponse.json(
        {
          error: `El depósito ($${montoDeposito.toFixed(
            2
          )}) no puede exceder el saldo restante ($${saldoActual.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Registrar depósito en transacción (el trigger actualizará la venta automáticamente)
    const resultado = await ejecutarTransaccion(async (cliente) => {
      const consultaDeposito = `
        INSERT INTO depositos (
          venta_id, monto, metodo_pago, fecha_deposito, notas
        ) VALUES (
          $1, $2, $3, $4, $5
        ) RETURNING *
      `;

      const parametrosDeposito = [
        datosLimpios.venta_id,
        montoDeposito,
        datosLimpios.metodo_pago || "efectivo",
        datosLimpios.fecha_deposito || new Date().toISOString().split("T")[0],
        datosLimpios.notas || null,
      ];

      const resultadoDeposito = await cliente.query(
        consultaDeposito,
        parametrosDeposito
      );

      // El trigger ya actualizó la venta, pero obtenemos los datos actualizados
      const ventaActualizada = await cliente.query(
        "SELECT total_depositado, saldo_restante FROM ventas WHERE id = $1",
        [datosLimpios.venta_id]
      );

      return {
        deposito: resultadoDeposito.rows[0],
        venta_actualizada: ventaActualizada.rows[0],
        venta_info: venta,
      };
    });

    return NextResponse.json(
      {
        mensaje: "Depósito registrado exitosamente",
        deposito: resultado.deposito,
        venta: {
          numero_venta: resultado.venta_info.numero_venta,
          cliente_nombre: resultado.venta_info.cliente_nombre,
          total_depositado: resultado.venta_actualizada.total_depositado,
          saldo_restante: resultado.venta_actualizada.saldo_restante,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registrando depósito:", error);

    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error registrando depósito" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar depósito existente
export async function PUT(request) {
  try {
    const datosOriginales = await request.json();
    const { id } = datosOriginales;

    if (!id) {
      return NextResponse.json(
        { error: "ID de depósito requerido" },
        { status: 400 }
      );
    }

    // Limpiar datos
    const datosLimpios = limpiarDatos(datosOriginales);

    // Verificar que el depósito existe
    const verificarDeposito = await ejecutarConsulta(
      `SELECT d.*, v.costo_total, v.total_depositado 
       FROM depositos d 
       INNER JOIN ventas v ON d.venta_id = v.id 
       WHERE d.id = $1`,
      [id]
    );

    if (verificarDeposito.rows.length === 0) {
      return NextResponse.json(
        { error: "Depósito no encontrado" },
        { status: 404 }
      );
    }

    const depositoActual = verificarDeposito.rows[0];

    // Validar nuevos datos
    const validacion = validarDeposito(
      datosLimpios,
      depositoActual.costo_total,
      depositoActual.total_depositado - depositoActual.monto
    );

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
        { status: 400 }
      );
    }

    // Actualizar depósito en transacción
    const resultado = await ejecutarTransaccion(async (cliente) => {
      const consultaActualizar = `
        UPDATE depositos SET
          monto = $2,
          metodo_pago = $3,
          fecha_deposito = $4,
          notas = $5
        WHERE id = $1
        RETURNING *
      `;

      const parametros = [
        id,
        parseFloat(datosLimpios.monto),
        datosLimpios.metodo_pago || depositoActual.metodo_pago,
        datosLimpios.fecha_deposito || depositoActual.fecha_deposito,
        datosLimpios.notas,
      ];

      const resultadoDeposito = await cliente.query(
        consultaActualizar,
        parametros
      );

      return resultadoDeposito.rows[0];
    });

    return NextResponse.json({
      mensaje: "Depósito actualizado exitosamente",
      deposito: resultado,
    });
  } catch (error) {
    console.error("Error actualizando depósito:", error);
    return NextResponse.json(
      { error: "Error actualizando depósito" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar depósito
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de depósito requerido" },
        { status: 400 }
      );
    }

    // Verificar que el depósito existe
    const verificarDeposito = await ejecutarConsulta(
      `SELECT d.*, v.numero_venta 
       FROM depositos d 
       INNER JOIN ventas v ON d.venta_id = v.id 
       WHERE d.id = $1`,
      [id]
    );

    if (verificarDeposito.rows.length === 0) {
      return NextResponse.json(
        { error: "Depósito no encontrado" },
        { status: 404 }
      );
    }

    const deposito = verificarDeposito.rows[0];

    // Eliminar depósito (el trigger actualizará la venta automáticamente)
    await ejecutarConsulta("DELETE FROM depositos WHERE id = $1", [id]);

    return NextResponse.json({
      mensaje: "Depósito eliminado exitosamente",
      venta_numero: deposito.numero_venta,
      monto_eliminado: deposito.monto,
    });
  } catch (error) {
    console.error("Error eliminando depósito:", error);
    return NextResponse.json(
      { error: "Error eliminando depósito" },
      { status: 500 }
    );
  }
}
