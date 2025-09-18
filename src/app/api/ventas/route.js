import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";
import { validarVenta, limpiarDatos } from "@/lib/validaciones";
import { generarNumeroVenta } from "@/lib/autenticacion";

// GET - Obtener todas las ventas
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get("limite")) || 50;
    const pagina = parseInt(searchParams.get("pagina")) || 1;
    const busqueda = searchParams.get("busqueda") || "";
    const estado = searchParams.get("estado") || "";
    const clienteId = searchParams.get("cliente_id") || "";

    const offset = (pagina - 1) * limite;

    let consulta = `
      SELECT 
        v.*,
        c.nombre_completo as cliente_nombre,
        c.expediente as cliente_expediente,
        c.email as cliente_email,
        c.celular as cliente_celular,
        p.nombre as periodo_nombre,
        COUNT(d.id) as total_depositos_registrados,
        COALESCE(SUM(d.monto), 0) as total_depositado_real
      FROM ventas v
      INNER JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN periodos_contables p ON v.periodo_id = p.id
      LEFT JOIN depositos d ON v.id = d.venta_id
    `;

    const parametros = [];
    let whereConditions = [];

    // Filtrar por búsqueda (número de venta o cliente)
    if (busqueda) {
      whereConditions.push(
        `(v.numero_venta ILIKE $${
          parametros.length + 1
        } OR c.nombre_completo ILIKE $${parametros.length + 1})`
      );
      parametros.push(`%${busqueda}%`);
    }

    // Filtrar por estado
    if (estado) {
      whereConditions.push(`v.estado = $${parametros.length + 1}`);
      parametros.push(estado);
    }

    // Filtrar por cliente
    if (clienteId) {
      whereConditions.push(`v.cliente_id = $${parametros.length + 1}`);
      parametros.push(clienteId);
    }

    // Agregar condiciones WHERE si existen
    if (whereConditions.length > 0) {
      consulta += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    consulta += `
      GROUP BY v.id, c.nombre_completo, c.expediente, c.email, c.celular, p.nombre
      ORDER BY v.fecha_venta DESC, v.fecha_creacion DESC
      LIMIT $${parametros.length + 1} OFFSET $${parametros.length + 2}
    `;

    parametros.push(limite, offset);

    console.log("Ejecutando consulta ventas:", consulta);
    console.log("Parámetros:", parametros);

    const resultado = await ejecutarConsulta(consulta, parametros);

    // Obtener estadísticas generales
    const consultaEstadisticas = `
      SELECT 
        COUNT(*) as total_ventas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_laboratorio' THEN 1 END) as en_laboratorio,
        COUNT(CASE WHEN estado = 'listo' THEN 1 END) as listos,
        COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as entregados,
        COALESCE(SUM(costo_total), 0) as total_ingresos,
        COALESCE(SUM(total_depositado), 0) as total_depositado,
        COALESCE(SUM(saldo_restante), 0) as total_pendiente_cobro
      FROM ventas
    `;

    const estadisticas = await ejecutarConsulta(consultaEstadisticas);

    return NextResponse.json({
      ventas: resultado.rows,
      estadisticas: estadisticas.rows[0],
      pagination: {
        pagina,
        limite,
        total: resultado.rows.length,
      },
    });
  } catch (error) {
    console.error("Error obteniendo ventas:", error);
    return NextResponse.json(
      { error: "Error obteniendo ventas: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva venta
export async function POST(request) {
  try {
    const datosOriginales = await request.json();

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);
    const validacion = validarVenta(datosLimpios);

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const verificarCliente = await ejecutarConsulta(
      "SELECT id, nombre_completo FROM clientes WHERE id = $1",
      [datosLimpios.cliente_id]
    );

    if (verificarCliente.rows.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Crear venta y depósito inicial en transacción
    const resultado = await ejecutarTransaccion(async (cliente) => {
      // Generar número de venta único
      const numeroVenta = generarNumeroVenta();

      // Obtener período contable activo
      const consultaPeriodo = `
        SELECT id FROM periodos_contables 
        WHERE activo = true 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
      `;
      const resultadoPeriodo = await cliente.query(consultaPeriodo);
      let periodoId = resultadoPeriodo.rows[0]?.id || null;

      // Si no hay período activo, crear uno
      if (!periodoId) {
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
        const nombrePeriodo = `${meses[mesActual]} / ${
          meses[(mesActual + 1) % 12]
        }`;

        const consultaNuevoPeriodo = `
          INSERT INTO periodos_contables (nombre, fecha_inicio, fecha_fin, activo)
          VALUES ($1, $2, $3, true)
          RETURNING id
        `;

        const nuevoPeriodo = await cliente.query(consultaNuevoPeriodo, [
          nombrePeriodo,
          fechaInicio.toISOString().split("T")[0],
          fechaFin.toISOString().split("T")[0],
        ]);

        periodoId = nuevoPeriodo.rows[0].id;
      }

      // Insertar venta
      const consultaVenta = `
        INSERT INTO ventas (
          numero_venta, cliente_id, periodo_id, marca_armazon, laboratorio,
          precio_armazon, precio_micas, costo_total, total_depositado, saldo_restante,
          imagen_receta, estado, fecha_llegada_laboratorio, fecha_entrega_cliente,
          fecha_venta, notas
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `;

      const parametrosVenta = [
        numeroVenta,
        datosLimpios.cliente_id,
        periodoId,
        datosLimpios.marca_armazon || null,
        datosLimpios.laboratorio || null,
        datosLimpios.precio_armazon
          ? parseFloat(datosLimpios.precio_armazon)
          : null,
        datosLimpios.precio_micas
          ? parseFloat(datosLimpios.precio_micas)
          : null,
        parseFloat(datosLimpios.costo_total),
        datosLimpios.deposito_inicial
          ? parseFloat(datosLimpios.deposito_inicial)
          : 0,
        datosLimpios.saldo_restante
          ? parseFloat(datosLimpios.saldo_restante)
          : parseFloat(datosLimpios.costo_total),
        datosLimpios.imagen_receta || null,
        datosLimpios.estado || "pendiente",
        datosLimpios.fecha_llegada_laboratorio || null,
        datosLimpios.fecha_entrega_cliente || null,
        datosLimpios.fecha_venta || new Date().toISOString().split("T")[0],
        datosLimpios.notas || null,
      ];

      const resultadoVenta = await cliente.query(
        consultaVenta,
        parametrosVenta
      );
      const ventaCreada = resultadoVenta.rows[0];

      // Si hay depósito inicial, registrarlo
      if (
        datosLimpios.deposito_inicial &&
        parseFloat(datosLimpios.deposito_inicial) > 0
      ) {
        const consultaDeposito = `
          INSERT INTO depositos (
            venta_id, monto, metodo_pago, fecha_deposito, notas
          ) VALUES (
            $1, $2, $3, $4, $5
          )
        `;

        const parametrosDeposito = [
          ventaCreada.id,
          parseFloat(datosLimpios.deposito_inicial),
          "efectivo", // Por defecto, se puede cambiar después
          datosLimpios.fecha_venta || new Date().toISOString().split("T")[0],
          "Depósito inicial",
        ];

        await cliente.query(consultaDeposito, parametrosDeposito);
      }

      return ventaCreada;
    });

    return NextResponse.json(
      {
        mensaje: "Venta registrada exitosamente",
        venta: resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando venta:", error);

    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una venta con ese número" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error registrando venta" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar venta existente
export async function PUT(request) {
  try {
    const datosOriginales = await request.json();
    const { id } = datosOriginales;

    if (!id) {
      return NextResponse.json(
        { error: "ID de venta requerido" },
        { status: 400 }
      );
    }

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);
    const validacion = validarVenta(datosLimpios);

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
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
        fecha_venta = $11,
        notas = $12,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const parametros = [
      id,
      datosLimpios.marca_armazon || null,
      datosLimpios.laboratorio || null,
      datosLimpios.precio_armazon
        ? parseFloat(datosLimpios.precio_armazon)
        : null,
      datosLimpios.precio_micas ? parseFloat(datosLimpios.precio_micas) : null,
      parseFloat(datosLimpios.costo_total),
      datosLimpios.imagen_receta || null,
      datosLimpios.estado || "pendiente",
      datosLimpios.fecha_llegada_laboratorio || null,
      datosLimpios.fecha_entrega_cliente || null,
      datosLimpios.fecha_venta || new Date().toISOString().split("T")[0],
      datosLimpios.notas || null,
    ];

    const resultado = await ejecutarConsulta(consultaActualizar, parametros);

    // Recalcular saldo restante basado en depósitos existentes
    const consultaActualizarSaldo = `
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
`;

    await ejecutarConsulta(consultaActualizarSaldo, [id]);

    return NextResponse.json({
      mensaje: "Venta actualizada exitosamente",
      venta: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando venta:", error);
    return NextResponse.json(
      { error: "Error actualizando venta" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar venta
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de venta requerido" },
        { status: 400 }
      );
    }

    // Verificar que la venta existe
    const verificarVenta = await ejecutarConsulta(
      "SELECT id, numero_venta, estado FROM ventas WHERE id = $1",
      [id]
    );

    if (verificarVenta.rows.length === 0) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const venta = verificarVenta.rows[0];

    // Solo permitir eliminación si la venta está en estado pendiente
    if (venta.estado !== "pendiente") {
      return NextResponse.json(
        {
          error: "Solo se pueden eliminar ventas en estado pendiente",
          sugerencia: 'Cambie el estado a "cancelado" en su lugar',
        },
        { status: 409 }
      );
    }

    // Eliminar venta (esto eliminará en cascada los depósitos)
    await ejecutarConsulta("DELETE FROM ventas WHERE id = $1", [id]);

    return NextResponse.json({
      mensaje: "Venta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando venta:", error);
    return NextResponse.json(
      { error: "Error eliminando venta" },
      { status: 500 }
    );
  }
}
