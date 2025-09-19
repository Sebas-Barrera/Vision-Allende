import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";
import { validarCliente, limpiarDatos } from "@/lib/validaciones";

// GET - Obtener cliente por ID con información completa
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de cliente requerido" },
        { status: 400 }
      );
    }

    // Obtener datos completos del cliente incluyendo antecedentes
    const consultaCliente = `
      SELECT 
        c.*,
        a.presion_alta,
        a.diabetes,
        a.alergias,
        a.notas_extras as antecedentes_notas
      FROM clientes c
      LEFT JOIN antecedentes_medicos a ON c.id = a.cliente_id
      WHERE c.id = $1
    `;

    const resultadoCliente = await ejecutarConsulta(consultaCliente, [id]);

    if (resultadoCliente.rows.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const cliente = resultadoCliente.rows[0];

    // Obtener graduaciones del cliente
    const consultaGraduaciones = `
      SELECT * FROM graduaciones 
      WHERE cliente_id = $1 
      ORDER BY tipo, fecha_examen DESC
    `;
    const resultadoGraduaciones = await ejecutarConsulta(consultaGraduaciones, [
      id,
    ]);

    // Obtener ventas del cliente
    const consultaVentas = `
      SELECT 
        v.*,
        p.nombre as periodo_nombre,
        COUNT(d.id) as total_depositos,
        COALESCE(SUM(d.monto), 0) as total_depositado_calculado
      FROM ventas v
      LEFT JOIN periodos_contables p ON v.periodo_id = p.id
      LEFT JOIN depositos d ON v.id = d.venta_id
      WHERE v.cliente_id = $1
      GROUP BY v.id, p.nombre
      ORDER BY v.fecha_venta DESC
    `;
    const resultadoVentas = await ejecutarConsulta(consultaVentas, [id]);

    // Calcular estadísticas del cliente
    const estadisticas = {
      total_ventas: resultadoVentas.rows.length,
      total_gastado: resultadoVentas.rows.reduce(
        (total, venta) => total + parseFloat(venta.costo_total || 0),
        0
      ),
      total_depositado: resultadoVentas.rows.reduce(
        (total, venta) => total + parseFloat(venta.total_depositado || 0),
        0
      ),
      saldo_pendiente: resultadoVentas.rows.reduce(
        (total, venta) => total + parseFloat(venta.saldo_restante || 0),
        0
      ),
      graduaciones_registradas: resultadoGraduaciones.rows.length,
    };

    return NextResponse.json({
      cliente,
      graduaciones: resultadoGraduaciones.rows,
      ventas: resultadoVentas.rows,
      estadisticas,
    });
  } catch (error) {
    console.error("Error obteniendo cliente:", error);
    return NextResponse.json(
      { error: "Error obteniendo información del cliente" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const datosOriginales = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de cliente requerido" },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const verificarCliente = await ejecutarConsulta(
      "SELECT id FROM clientes WHERE id = $1",
      [id]
    );

    if (verificarCliente.rows.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);
    const validacion = validarCliente(datosLimpios);

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
        { status: 400 }
      );
    }

    // Actualizar cliente y antecedentes en transacción
    const resultado = await ejecutarTransaccion(async (cliente) => {
      // Actualizar datos del cliente
      const consultaActualizarCliente = `
        UPDATE clientes SET
          nombre_completo = $2,
          fecha_nacimiento = $3,
          edad = $4,
          ocupacion = $5,
          direccion = $6,
          email = $7,
          telefono = $8,
          celular = $9,
          motivo_consulta = $10,
          peso = $11,
          talla = $12,
          imc = $13,
          fr = $14,
          temperatura = $15,
          saturacion_oxigeno = $16,
          ritmo_cardiaco = $17,
          presion_arterial = $18,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const parametrosCliente = [
        id,
        datosLimpios.nombre_completo,
        datosLimpios.fecha_nacimiento || null,
        datosLimpios.edad ? parseInt(datosLimpios.edad) : null,
        datosLimpios.ocupacion,
        datosLimpios.direccion,
        datosLimpios.email,
        datosLimpios.telefono,
        datosLimpios.celular,
        datosLimpios.motivo_consulta,
        datosLimpios.peso ? parseFloat(datosLimpios.peso) : null,
        datosLimpios.talla ? parseFloat(datosLimpios.talla) : null,
        datosLimpios.imc ? parseFloat(datosLimpios.imc) : null,
        datosLimpios.fr ? parseInt(datosLimpios.fr) : null,
        datosLimpios.temperatura ? parseFloat(datosLimpios.temperatura) : null,
        datosLimpios.saturacion_oxigeno
          ? parseInt(datosLimpios.saturacion_oxigeno)
          : null,
        datosLimpios.ritmo_cardiaco
          ? parseInt(datosLimpios.ritmo_cardiaco)
          : null,
        datosLimpios.presion_arterial,
      ];

      const resultadoCliente = await cliente.query(
        consultaActualizarCliente,
        parametrosCliente
      );

      // Actualizar antecedentes médicos
      const consultaActualizarAntecedentes = `
        UPDATE antecedentes_medicos SET
          presion_alta = $2,
          diabetes = $3,
          alergias = $4,
          notas_extras = $5,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE cliente_id = $1
      `;

      const parametrosAntecedentes = [
        id,
        datosLimpios.presion_alta || false,
        datosLimpios.diabetes || false,
        datosLimpios.alergias,
        datosLimpios.notas_extras,
      ];

      await cliente.query(
        consultaActualizarAntecedentes,
        parametrosAntecedentes
      );

      return resultadoCliente.rows[0];
    });

    return NextResponse.json({
      mensaje: "Cliente actualizado exitosamente",
      cliente: resultado,
    });
  } catch (error) {
    console.error("Error actualizando cliente:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese expediente" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error actualizando cliente" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cliente (soft delete recomendado)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de cliente requerido" },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const verificarCliente = await ejecutarConsulta(
      "SELECT id FROM clientes WHERE id = $1",
      [id]
    );

    if (verificarCliente.rows.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene ventas asociadas
    const verificarVentas = await ejecutarConsulta(
      "SELECT COUNT(*) as total FROM ventas WHERE cliente_id = $1",
      [id]
    );

    const tieneVentas = parseInt(verificarVentas.rows[0].total) > 0;

    if (tieneVentas) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el cliente porque tiene ventas asociadas",
          sugerencia: "Considere desactivar el cliente en lugar de eliminarlo",
        },
        { status: 409 }
      );
    }

    // Eliminar cliente (esto eliminará en cascada antecedentes y graduaciones)
    await ejecutarConsulta("DELETE FROM clientes WHERE id = $1", [id]);

    return NextResponse.json({
      mensaje: "Cliente eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    return NextResponse.json(
      { error: "Error eliminando cliente" },
      { status: 500 }
    );
  }
}
