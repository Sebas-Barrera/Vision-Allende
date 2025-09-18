import { NextResponse } from "next/server";
import { ejecutarConsulta } from "@/lib/conexion-bd";
import { validarGraduacion, limpiarDatos } from "@/lib/validaciones";

// GET - Obtener graduaciones (por cliente o todas)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("cliente_id");
    const tipo = searchParams.get("tipo"); // 'lejos' o 'cerca'
    const limite = parseInt(searchParams.get("limite")) || 50;

    let consulta = `
      SELECT g.*, c.nombre_completo as cliente_nombre, c.expediente
      FROM graduaciones g
      INNER JOIN clientes c ON g.cliente_id = c.id
    `;

    const parametros = [];
    let whereConditions = [];

    // Filtrar por cliente si se especifica
    if (clienteId) {
      whereConditions.push(`g.cliente_id = $${parametros.length + 1}`);
      parametros.push(clienteId);
    }

    // Filtrar por tipo si se especifica
    if (tipo && ["lejos", "cerca"].includes(tipo)) {
      whereConditions.push(`g.tipo = $${parametros.length + 1}`);
      parametros.push(tipo);
    }

    // Agregar condiciones WHERE si existen
    if (whereConditions.length > 0) {
      consulta += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    consulta += ` 
      ORDER BY g.fecha_examen DESC, g.fecha_creacion DESC
      LIMIT $${parametros.length + 1}
    `;
    parametros.push(limite);

    const resultado = await ejecutarConsulta(consulta, parametros);

    return NextResponse.json({
      graduaciones: resultado.rows,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error("Error obteniendo graduaciones:", error);
    return NextResponse.json(
      { error: "Error obteniendo graduaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva graduación
export async function POST(request) {
  try {
    const datosOriginales = await request.json();

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);
    const validacion = validarGraduacion(datosLimpios);

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
      "SELECT id FROM clientes WHERE id = $1",
      [datosLimpios.cliente_id]
    );

    if (verificarCliente.rows.length === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe una graduación del mismo tipo para este cliente
    const graduacionExistente = await ejecutarConsulta(
      "SELECT id FROM graduaciones WHERE cliente_id = $1 AND tipo = $2",
      [datosLimpios.cliente_id, datosLimpios.tipo]
    );

    if (graduacionExistente.rows.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existe una graduación de ${datosLimpios.tipo} para este cliente. Use PUT para actualizar.`,
          graduacion_existente_id: graduacionExistente.rows[0].id,
        },
        { status: 409 }
      );
    }

    // Insertar nueva graduación
    const consultaInsertar = `
      INSERT INTO graduaciones (
        cliente_id, tipo, od_esfera, od_cilindro, od_eje, od_adicion,
        oi_esfera, oi_cilindro, oi_eje, oi_adicion, imagen_resultado,
        fecha_examen, notas
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;

    const parametros = [
      datosLimpios.cliente_id,
      datosLimpios.tipo,
      datosLimpios.od_esfera ? parseFloat(datosLimpios.od_esfera) : null,
      datosLimpios.od_cilindro ? parseFloat(datosLimpios.od_cilindro) : null,
      datosLimpios.od_eje ? parseInt(datosLimpios.od_eje) : null,
      datosLimpios.od_adicion ? parseFloat(datosLimpios.od_adicion) : null,
      datosLimpios.oi_esfera ? parseFloat(datosLimpios.oi_esfera) : null,
      datosLimpios.oi_cilindro ? parseFloat(datosLimpios.oi_cilindro) : null,
      datosLimpios.oi_eje ? parseInt(datosLimpios.oi_eje) : null,
      datosLimpios.oi_adicion ? parseFloat(datosLimpios.oi_adicion) : null,
      datosLimpios.imagen_resultado || null,
      datosLimpios.fecha_examen || new Date().toISOString().split("T")[0],
      datosLimpios.notas || null,
    ];

    const resultado = await ejecutarConsulta(consultaInsertar, parametros);

    return NextResponse.json(
      {
        mensaje: "Graduación registrada exitosamente",
        graduacion: resultado.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando graduación:", error);

    // Manejar errores específicos
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error registrando graduación" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar graduación existente
export async function PUT(request) {
  try {
    const datosOriginales = await request.json();
    const { id } = datosOriginales;

    if (!id) {
      return NextResponse.json(
        { error: "ID de graduación requerido" },
        { status: 400 }
      );
    }

    // Limpiar y validar datos
    const datosLimpios = limpiarDatos(datosOriginales);
    const validacion = validarGraduacion(datosLimpios);

    if (!validacion.esValido) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          errores: validacion.errores,
        },
        { status: 400 }
      );
    }

    // Verificar que la graduación existe
    const verificarGraduacion = await ejecutarConsulta(
      "SELECT id FROM graduaciones WHERE id = $1",
      [id]
    );

    if (verificarGraduacion.rows.length === 0) {
      return NextResponse.json(
        { error: "Graduación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar graduación
    const consultaActualizar = `
      UPDATE graduaciones SET
        od_esfera = $2, od_cilindro = $3, od_eje = $4, od_adicion = $5,
        oi_esfera = $6, oi_cilindro = $7, oi_eje = $8, oi_adicion = $9,
        imagen_resultado = $10, fecha_examen = $11, notas = $12,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const parametros = [
      id,
      datosLimpios.od_esfera ? parseFloat(datosLimpios.od_esfera) : null,
      datosLimpios.od_cilindro ? parseFloat(datosLimpios.od_cilindro) : null,
      datosLimpios.od_eje ? parseInt(datosLimpios.od_eje) : null,
      datosLimpios.od_adicion ? parseFloat(datosLimpios.od_adicion) : null,
      datosLimpios.oi_esfera ? parseFloat(datosLimpios.oi_esfera) : null,
      datosLimpios.oi_cilindro ? parseFloat(datosLimpios.oi_cilindro) : null,
      datosLimpios.oi_eje ? parseInt(datosLimpios.oi_eje) : null,
      datosLimpios.oi_adicion ? parseFloat(datosLimpios.oi_adicion) : null,
      datosLimpios.imagen_resultado || null,
      datosLimpios.fecha_examen || new Date().toISOString().split("T")[0],
      datosLimpios.notas || null,
    ];

    const resultado = await ejecutarConsulta(consultaActualizar, parametros);

    return NextResponse.json({
      mensaje: "Graduación actualizada exitosamente",
      graduacion: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando graduación:", error);
    return NextResponse.json(
      { error: "Error actualizando graduación" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar graduación
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de graduación requerido" },
        { status: 400 }
      );
    }

    // Verificar que la graduación existe
    const verificarGraduacion = await ejecutarConsulta(
      "SELECT id FROM graduaciones WHERE id = $1",
      [id]
    );

    if (verificarGraduacion.rows.length === 0) {
      return NextResponse.json(
        { error: "Graduación no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar graduación
    await ejecutarConsulta("DELETE FROM graduaciones WHERE id = $1", [id]);

    return NextResponse.json({
      mensaje: "Graduación eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando graduación:", error);
    return NextResponse.json(
      { error: "Error eliminando graduación" },
      { status: 500 }
    );
  }
}
