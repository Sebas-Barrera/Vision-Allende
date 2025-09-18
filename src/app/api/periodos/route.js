import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";

// GET - Obtener todos los períodos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivo = searchParams.get("activo") === "true";
    const limite = parseInt(searchParams.get("limite")) || 50;

    let consulta;
    let parametros = [];

    if (soloActivo) {
      // Solo el período activo
      consulta = `
        SELECT *,
          TO_CHAR(fecha_inicio, 'DD/MM/YYYY') as fecha_inicio_formato,
          TO_CHAR(fecha_fin, 'DD/MM/YYYY') as fecha_fin_formato,
          TO_CHAR(fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_creacion_formato
        FROM periodos_contables 
        WHERE activo = true
        ORDER BY fecha_creacion DESC
        LIMIT 1
      `;
    } else {
      // Todos los períodos
      consulta = `
        SELECT *,
          TO_CHAR(fecha_inicio, 'DD/MM/YYYY') as fecha_inicio_formato,
          TO_CHAR(fecha_fin, 'DD/MM/YYYY') as fecha_fin_formato,
          TO_CHAR(fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_creacion_formato
        FROM periodos_contables 
        ORDER BY fecha_creacion DESC
        LIMIT $1
      `;
      parametros = [limite];
    }

    const resultado = await ejecutarConsulta(consulta, parametros);

    // Si se solicita solo activo pero no hay ninguno, crear el primer período
    if (soloActivo && resultado.rows.length === 0) {
      const nuevoPeriodo = await crearPrimerPeriodo();
      return NextResponse.json({
        periodo_activo: nuevoPeriodo,
        todos_periodos: [nuevoPeriodo],
      });
    }

    return NextResponse.json({
      periodos: resultado.rows,
      periodo_activo: soloActivo
        ? resultado.rows[0]
        : resultado.rows.find((p) => p.activo),
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error("Error obteniendo períodos:", error);
    return NextResponse.json(
      { error: "Error obteniendo períodos: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo período (cerrar período actual)
export async function POST(request) {
  try {
    const datosOriginales = await request.json();
    const { confirmar_cierre = false } = datosOriginales;

    if (!confirmar_cierre) {
      return NextResponse.json(
        { error: "Debe confirmar el cierre del período" },
        { status: 400 }
      );
    }

    // Ejecutar cierre de período en transacción
    const resultado = await ejecutarTransaccion(async (cliente) => {
      // 1. Obtener período activo actual
      const consultaPeriodoActual = `
        SELECT * FROM periodos_contables 
        WHERE activo = true 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
      `;
      const periodoActual = await cliente.query(consultaPeriodoActual);

      if (periodoActual.rows.length === 0) {
        throw new Error("No hay período activo para cerrar");
      }

      const periodoAnterior = periodoActual.rows[0];

      // 2. Obtener ventas con saldo pendiente del período actual
      const consultaVentasPendientes = `
        SELECT 
          v.id,
          v.numero_venta,
          v.cliente_id,
          v.saldo_restante,
          v.marca_armazon,
          v.laboratorio,
          v.imagen_receta,
          v.estado,
          v.fecha_llegada_laboratorio,
          v.fecha_entrega_cliente,
          v.notas,
          c.nombre_completo as cliente_nombre
        FROM ventas v
        INNER JOIN clientes c ON v.cliente_id = c.id
        WHERE v.periodo_id = $1 
        AND v.saldo_restante > 0
        AND v.estado != 'cancelado'
      `;
      const ventasPendientes = await cliente.query(consultaVentasPendientes, [
        periodoAnterior.id,
      ]);

      // 3. Calcular fechas del nuevo período
      const hoy = new Date();
      const mesActual = hoy.getMonth(); // 0-11
      const añoActual = hoy.getFullYear();

      // Nuevo período: del 7 del mes actual al 6 del siguiente mes
      const fechaInicio = new Date(añoActual, mesActual, 7);
      const fechaFin = new Date(añoActual, mesActual + 1, 6);

      // Generar nombre del período
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const nombrePeriodo = `${meses[mesActual]} / ${
        meses[(mesActual + 1) % 12]
      }`;

      // 4. Crear nuevo período
      const consultaNuevoPeriodo = `
        INSERT INTO periodos_contables (nombre, fecha_inicio, fecha_fin, activo)
        VALUES ($1, $2, $3, true)
        RETURNING *
      `;
      const nuevoPeriodo = await cliente.query(consultaNuevoPeriodo, [
        nombrePeriodo,
        fechaInicio.toISOString().split("T")[0],
        fechaFin.toISOString().split("T")[0],
      ]);

      const periodoNuevo = nuevoPeriodo.rows[0];

      // 5. Desactivar período anterior
      await cliente.query(
        "UPDATE periodos_contables SET activo = false WHERE id = $1",
        [periodoAnterior.id]
      );

      // 6. Migrar ventas pendientes al nuevo período
      const ventasMigradas = [];

      for (const venta of ventasPendientes.rows) {
        // Generar nuevo número de venta
        const timestamp = Date.now().toString().slice(-4);
        const numeroVenta = `VTA-${fechaInicio.getFullYear()}${String(
          fechaInicio.getMonth() + 1
        ).padStart(2, "0")}${String(fechaInicio.getDate()).padStart(
          2,
          "0"
        )}-${timestamp}`;

        // Crear nueva venta en el nuevo período
        const consultaNuevaVenta = `
          INSERT INTO ventas (
            numero_venta, cliente_id, periodo_id, marca_armazon, laboratorio,
            precio_armazon, precio_micas, costo_total, total_depositado, saldo_restante,
            imagen_receta, estado, fecha_llegada_laboratorio, fecha_entrega_cliente,
            fecha_venta, notas
          ) VALUES (
            $1, $2, $3, $4, $5, 0, 0, $6, 0, $6, $7, $8, $9, $10, $11, $12
          ) RETURNING *
        `;

        const parametrosNuevaVenta = [
          numeroVenta,
          venta.cliente_id,
          periodoNuevo.id,
          venta.marca_armazon,
          venta.laboratorio,
          venta.saldo_restante, // El saldo pendiente se convierte en el nuevo costo total
          venta.imagen_receta,
          venta.estado === "entregado" ? "pendiente" : venta.estado, // Reset estado si ya estaba entregado
          venta.fecha_llegada_laboratorio,
          venta.fecha_entrega_cliente,
          fechaInicio.toISOString().split("T")[0], // Fecha del nuevo período
          `Migrado del período anterior (${
            periodoAnterior.nombre
          }). Venta original: ${venta.numero_venta}${
            venta.notas ? "\n\nNotas anteriores: " + venta.notas : ""
          }`,
        ];

        const ventaMigrada = await cliente.query(
          consultaNuevaVenta,
          parametrosNuevaVenta
        );
        ventasMigradas.push({
          venta_original: venta,
          venta_nueva: ventaMigrada.rows[0],
        });
      }

      return {
        periodo_anterior: periodoAnterior,
        periodo_nuevo: periodoNuevo,
        ventas_migradas: ventasMigradas,
        total_migrado: ventasPendientes.rows.reduce(
          (sum, v) => sum + parseFloat(v.saldo_restante),
          0
        ),
      };
    });

    return NextResponse.json(
      {
        mensaje: "Período cerrado y nuevo período creado exitosamente",
        ...resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error cerrando período:", error);
    return NextResponse.json(
      { error: "Error cerrando período: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar período (solo nombre y fechas, no migración)
export async function PUT(request) {
  try {
    const datos = await request.json();
    const { id, nombre, fecha_inicio, fecha_fin } = datos;

    if (!id) {
      return NextResponse.json(
        { error: "ID de período requerido" },
        { status: 400 }
      );
    }

    // Verificar que el período existe
    const verificar = await ejecutarConsulta(
      "SELECT id, activo FROM periodos_contables WHERE id = $1",
      [id]
    );

    if (verificar.rows.length === 0) {
      return NextResponse.json(
        { error: "Período no encontrado" },
        { status: 404 }
      );
    }

    // Solo permitir editar si no es el período activo o si solo se cambia el nombre
    const periodo = verificar.rows[0];

    const consulta = `
      UPDATE periodos_contables 
      SET nombre = $2, fecha_inicio = $3, fecha_fin = $4
      WHERE id = $1
      RETURNING *
    `;

    const resultado = await ejecutarConsulta(consulta, [
      id,
      nombre,
      fecha_inicio,
      fecha_fin,
    ]);

    return NextResponse.json({
      mensaje: "Período actualizado exitosamente",
      periodo: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando período:", error);
    return NextResponse.json(
      { error: "Error actualizando período" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar período (solo si no tiene ventas asociadas)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de período requerido" },
        { status: 400 }
      );
    }

    // Verificar que el período existe y no es el activo
    const verificar = await ejecutarConsulta(
      "SELECT id, nombre, activo FROM periodos_contables WHERE id = $1",
      [id]
    );

    if (verificar.rows.length === 0) {
      return NextResponse.json(
        { error: "Período no encontrado" },
        { status: 404 }
      );
    }

    const periodo = verificar.rows[0];

    if (periodo.activo) {
      return NextResponse.json(
        { error: "No se puede eliminar el período activo" },
        { status: 409 }
      );
    }

    // Verificar que no tiene ventas asociadas
    const ventasAsociadas = await ejecutarConsulta(
      "SELECT COUNT(*) as total FROM ventas WHERE periodo_id = $1",
      [id]
    );

    if (parseInt(ventasAsociadas.rows[0].total) > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el período porque tiene ventas asociadas",
          ventas_asociadas: ventasAsociadas.rows[0].total,
        },
        { status: 409 }
      );
    }

    // Eliminar período
    await ejecutarConsulta("DELETE FROM periodos_contables WHERE id = $1", [
      id,
    ]);

    return NextResponse.json({
      mensaje: "Período eliminado exitosamente",
      periodo_eliminado: periodo.nombre,
    });
  } catch (error) {
    console.error("Error eliminando período:", error);
    return NextResponse.json(
      { error: "Error eliminando período" },
      { status: 500 }
    );
  }
}

// Función auxiliar para crear el primer período
async function crearPrimerPeriodo() {
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  const fechaInicio = new Date(añoActual, mesActual, 7);
  const fechaFin = new Date(añoActual, mesActual + 1, 6);

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const nombrePeriodo = `${meses[mesActual]} / ${meses[(mesActual + 1) % 12]}`;

  const consulta = `
    INSERT INTO periodos_contables (nombre, fecha_inicio, fecha_fin, activo)
    VALUES ($1, $2, $3, true)
    RETURNING *
  `;

  const resultado = await ejecutarConsulta(consulta, [
    nombrePeriodo,
    fechaInicio.toISOString().split("T")[0],
    fechaFin.toISOString().split("T")[0],
  ]);

  return resultado.rows[0];
}
