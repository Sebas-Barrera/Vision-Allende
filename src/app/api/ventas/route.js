import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";
import { validarVenta, limpiarDatos } from "@/lib/validaciones";
import { generarNumeroVenta } from "@/lib/autenticacion";
import { parsearDinero, sumarDinero, restarDinero } from "@/lib/dinero-utils";

// GET - Obtener todas las ventas (mantén tu código GET existente)
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
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN periodos_contables p ON v.periodo_id = p.id
      LEFT JOIN depositos d ON v.id = d.venta_id
    `;

    const parametros = [];
    let whereConditions = [];

    // Filtrar por búsqueda (número de venta o nombre de cliente)
    if (busqueda) {
      whereConditions.push(
        "(v.numero_venta ILIKE $" +
          (parametros.length + 1) +
          " OR c.nombre_completo ILIKE $" +
          (parametros.length + 2) +
          ")"
      );
      parametros.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    // Filtrar por estado
    if (estado) {
      if (estado === "pagado") {
        // Estado especial: pagado = saldo restante 0 o menos
        whereConditions.push("v.saldo_restante <= 0");
      } else if (estado === "adeudo") {
        // Estado especial: adeudo = saldo restante mayor a 0
        whereConditions.push("v.saldo_restante > 0");
      } else {
        // Estados normales: pendiente, en_laboratorio, listo, entregado, cancelado
        whereConditions.push("v.estado = $" + (parametros.length + 1));
        parametros.push(estado);
      }
    }

    // Filtrar por cliente específico
    if (clienteId) {
      whereConditions.push("v.cliente_id = $" + (parametros.length + 1));
      parametros.push(clienteId);
    }

    if (whereConditions.length > 0) {
      consulta += " WHERE " + whereConditions.join(" AND ");
    }

    consulta +=
      " GROUP BY v.id, c.nombre_completo, c.expediente, c.email, c.celular, p.nombre ORDER BY v.fecha_creacion DESC LIMIT $" +
      (parametros.length + 1) +
      " OFFSET $" +
      (parametros.length + 2);
    parametros.push(limite, offset);

    const resultado = await ejecutarConsulta(consulta, parametros);

    // Obtener estadísticas generales
    const estadisticas = await ejecutarConsulta(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(costo_total), 0) as total_vendido,
        COALESCE(SUM(saldo_restante), 0) as total_pendiente,
        COUNT(CASE WHEN saldo_restante <= 0 THEN 1 END) as ventas_pagadas
      FROM ventas
    `);

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

// POST - Crear nueva venta (CORREGIDO PARA MANEJAR FORMDATA)
export async function POST(request) {
  try {
    // CAMBIO PRINCIPAL: Manejar FormData en lugar de JSON
    const formData = await request.formData();

    // Convertir FormData a objeto
    const datosOriginales = {};
    for (const [key, value] of formData.entries()) {
      // Si el valor es un archivo, manejarlo por separado
      if (key === "imagen_receta" && value instanceof File) {
        datosOriginales[key] = value;
      } else {
        datosOriginales[key] = value;
      }
    }

    // Limpiar y validar datos (excluyendo archivos de la validación)
    const datosParaValidar = { ...datosOriginales };
    delete datosParaValidar.imagen_receta; // Remover archivo antes de validar

    const datosLimpios = limpiarDatos(datosParaValidar);
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

    // Manejar archivo de imagen si existe
    let rutaImagen = null;
    if (
      datosOriginales.imagen_receta &&
      datosOriginales.imagen_receta instanceof File
    ) {
      try {
        // Aquí puedes implementar la lógica para guardar el archivo
        // Por ahora, solo guardaremos la referencia del nombre del archivo
        rutaImagen = `recetas/${Date.now()}_${
          datosOriginales.imagen_receta.name
        }`;

        // TODO: Implementar guardado real del archivo
        // const buffer = await datosOriginales.imagen_receta.arrayBuffer();
        // const bytes = new Uint8Array(buffer);
        // await fs.writeFile(`uploads/${rutaImagen}`, bytes);
      } catch (error) {
        console.error("Error procesando imagen:", error);
        // No fallar por el archivo, solo continuar sin imagen
      }
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
        const fechaActual = new Date();

        // Calcular fechas del período (del día 7 de este mes al día 6 del siguiente)
        const anio = fechaActual.getFullYear();
        const mes = fechaActual.getMonth(); // 0-based (0 = enero)

        // Fecha de inicio: día 7 del mes actual
        const fechaInicio = new Date(anio, mes, 7);

        // Si estamos antes del día 7, el período anterior aún está activo
        // Crear período que inicia el día 7 de este mes
        if (fechaActual.getDate() < 7) {
          fechaInicio.setMonth(mes - 1); // Mes anterior
        }

        // Fecha fin: día 6 del siguiente mes
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaInicio.getMonth() + 1);
        fechaFin.setDate(6);

        // Nombre del período
        const mesInicio = fechaInicio.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        });
        const mesFin = fechaFin.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        });
        const nombrePeriodo = `${mesInicio} / ${mesFin}`;

        const consultaCrearPeriodo = `
          INSERT INTO periodos_contables (nombre, fecha_inicio, fecha_fin, activo)
          VALUES ($1, $2, $3, true)
          RETURNING id
        `;
        const nuevoPeriodo = await cliente.query(consultaCrearPeriodo, [
          nombrePeriodo,
          fechaInicio.toISOString().split("T")[0], // Solo la fecha (YYYY-MM-DD)
          fechaFin.toISOString().split("T")[0],
        ]);
        periodoId = nuevoPeriodo.rows[0].id;
      }

      // Calcular saldo restante
      const costoTotal = parsearDinero(datosLimpios.costo_total);
      const depositoInicial = parsearDinero(datosLimpios.deposito_inicial);
      const saldoRestante = restarDinero(costoTotal, depositoInicial);

      // Insertar venta
      const consultaVenta = `
        INSERT INTO ventas (
          numero_venta, cliente_id, marca_armazon, laboratorio, 
          precio_armazon, precio_micas, costo_total, saldo_restante, 
          estado, fecha_venta, fecha_llegada_laboratorio, fecha_entrega_cliente,
          notas, imagen_receta, periodo_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *
      `;

      const parametrosVenta = [
        numeroVenta,
        datosLimpios.cliente_id,
        datosLimpios.marca_armazon || null,
        datosLimpios.laboratorio || null,
        datosLimpios.precio_armazon
          ? parsearDinero(datosLimpios.precio_armazon)
          : null,
        datosLimpios.precio_micas
          ? parsearDinero(datosLimpios.precio_micas)
          : null,
        costoTotal,
        saldoRestante,
        datosLimpios.estado || "pendiente",
        datosLimpios.fecha_venta || new Date().toISOString().split("T")[0],
        datosLimpios.fecha_llegada_laboratorio || null,
        datosLimpios.fecha_entrega_cliente || null,
        datosLimpios.notas || null,
        rutaImagen, // Ruta de la imagen
        periodoId,
      ];

      const resultadoVenta = await cliente.query(
        consultaVenta,
        parametrosVenta
      );
      const ventaCreada = resultadoVenta.rows[0];

      // Si hay depósito inicial, registrarlo
      if (depositoInicial > 0) {
        const consultaDeposito = `
          INSERT INTO depositos (
            venta_id, monto, metodo_pago, fecha_deposito, notas
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        await cliente.query(consultaDeposito, [
          ventaCreada.id,
          depositoInicial,
          "efectivo", // Default por ahora
          datosLimpios.fecha_venta || new Date().toISOString().split("T")[0],
          "Depósito inicial",
        ]);
      }

      return ventaCreada;
    });

    return NextResponse.json({
      mensaje: "Venta creada exitosamente",
      venta: resultado,
    });
  } catch (error) {
    console.error("Error creando venta:", error);

    // Dar información más detallada del error
    if (error.message.includes("invalid input syntax")) {
      return NextResponse.json(
        {
          error:
            "Error en formato de datos. Verifique que los números estén correctos.",
        },
        { status: 400 }
      );
    }

    if (error.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Ya existe una venta con ese número" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}
