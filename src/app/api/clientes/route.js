import { NextResponse } from "next/server";
import { ejecutarConsulta, ejecutarTransaccion } from "@/lib/conexion-bd";
import { validarCliente, limpiarDatos } from "@/lib/validaciones";
import { generarNumeroExpediente } from "@/lib/autenticacion";

// GET - Obtener todos los clientes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get("limite")) || 50;
    const pagina = parseInt(searchParams.get("pagina")) || 1;
    const busqueda = searchParams.get("busqueda") || "";

    const offset = (pagina - 1) * limite;

    let consulta;
    let parametros = [];

    if (busqueda) {
      // Con búsqueda
      consulta = `
        SELECT c.*, 
               COALESCE(v.total_ventas, 0) as total_ventas,
               COALESCE(v.total_gastado, 0) as total_gastado
        FROM clientes c
        LEFT JOIN (
          SELECT 
            cliente_id,
            COUNT(*) as total_ventas,
            SUM(costo_total) as total_gastado
          FROM ventas 
          GROUP BY cliente_id
        ) v ON c.id = v.cliente_id
        WHERE c.nombre_completo ILIKE $1 OR c.expediente ILIKE $1
        ORDER BY c.fecha_registro DESC
        LIMIT $2 OFFSET $3
      `;
      parametros = [`%${busqueda}%`, limite, offset];
    } else {
      // Sin búsqueda
      consulta = `
        SELECT c.*, 
               COALESCE(v.total_ventas, 0) as total_ventas,
               COALESCE(v.total_gastado, 0) as total_gastado
        FROM clientes c
        LEFT JOIN (
          SELECT 
            cliente_id,
            COUNT(*) as total_ventas,
            SUM(costo_total) as total_gastado
          FROM ventas 
          GROUP BY cliente_id
        ) v ON c.id = v.cliente_id
        ORDER BY c.fecha_registro DESC
        LIMIT $1 OFFSET $2
      `;
      parametros = [limite, offset];
    }

    console.log("Ejecutando consulta clientes:", consulta);
    console.log("Parámetros:", parametros);

    const resultado = await ejecutarConsulta(consulta, parametros);

    console.log(
      "Resultado clientes:",
      resultado.rows.length,
      "clientes encontrados"
    );

    // Mapear fecha_registro a fecha_creacion para compatibilidad con el frontend
    const clientesConCompatibilidad = resultado.rows.map((cliente) => ({
      ...cliente,
      fecha_creacion: cliente.fecha_registro,
    }));

    return NextResponse.json({
      clientes: clientesConCompatibilidad,
      pagination: {
        pagina,
        limite,
        total: resultado.rows.length,
      },
    });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    return NextResponse.json(
      { error: "Error obteniendo clientes: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo cliente
export async function POST(request) {
  try {
    const datosOriginales = await request.json();

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

    // Crear cliente y antecedentes en una transacción
    const resultado = await ejecutarTransaccion(async (cliente) => {
      // Generar expediente único si no se proporciona
      const expediente = datosLimpios.expediente || generarNumeroExpediente();

      // Insertar cliente
      const consultaCliente = `
        INSERT INTO clientes (
          expediente, nombre_completo, fecha_nacimiento, edad, ocupacion,
          direccion, email, telefono, celular, motivo_consulta, peso, talla, imc,
          fr, temperatura, saturacion_oxigeno, ritmo_cardiaco, presion_arterial
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;

      const parametrosCliente = [
        expediente,
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
        consultaCliente,
        parametrosCliente
      );
      const clienteCreado = resultadoCliente.rows[0];

      // Insertar antecedentes médicos
      const consultaAntecedentes = `
        INSERT INTO antecedentes_medicos (
          cliente_id, presion_alta, diabetes, alergias, notas_extras
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const parametrosAntecedentes = [
        clienteCreado.id,
        datosLimpios.presion_alta || false,
        datosLimpios.diabetes || false,
        datosLimpios.alergias,
        datosLimpios.notas_extras,
      ];

      await cliente.query(consultaAntecedentes, parametrosAntecedentes);

      return clienteCreado;
    });

    return NextResponse.json(
      {
        mensaje: "Cliente registrado exitosamente",
        cliente: resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando cliente:", error);

    if (error.code === "23505") {
      // Violación de unicidad
      return NextResponse.json(
        { error: "Ya existe un cliente con ese expediente" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error registrando cliente" },
      { status: 500 }
    );
  }
}
