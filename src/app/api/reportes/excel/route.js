import { NextResponse } from "next/server";
import { ejecutarConsulta } from "@/lib/conexion-bd";
import * as XLSX from "xlsx";

// GET - Generar y descargar reportes en Excel
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoReporte = searchParams.get("tipo") || "general"; // general, efectivo, tarjeta, transferencia
    const periodoId = searchParams.get("periodo_id");
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");

    // Validar parámetros
    if (!periodoId && !fechaInicio && !fechaFin) {
      return NextResponse.json(
        { error: "Debe especificar período o rango de fechas" },
        { status: 400 }
      );
    }

    let datosReporte;
    let nombreArchivo;

    switch (tipoReporte) {
      case "general":
        datosReporte = await generarReporteGeneral(
          periodoId,
          fechaInicio,
          fechaFin
        );
        nombreArchivo = `Reporte_General_${
          datosReporte.periodo_nombre || "Personalizado"
        }.xlsx`;
        break;
      case "efectivo":
        datosReporte = await generarReportePorMetodo(
          "efectivo",
          periodoId,
          fechaInicio,
          fechaFin
        );
        nombreArchivo = `Reporte_Efectivo_${
          datosReporte.periodo_nombre || "Personalizado"
        }.xlsx`;
        break;
      case "tarjeta":
        datosReporte = await generarReportePorMetodo(
          "tarjeta",
          periodoId,
          fechaInicio,
          fechaFin
        );
        nombreArchivo = `Reporte_Tarjeta_${
          datosReporte.periodo_nombre || "Personalizado"
        }.xlsx`;
        break;
      case "transferencia":
        datosReporte = await generarReportePorMetodo(
          "transferencia",
          periodoId,
          fechaInicio,
          fechaFin
        );
        nombreArchivo = `Reporte_Transferencia_${
          datosReporte.periodo_nombre || "Personalizado"
        }.xlsx`;
        break;
      case "todos":
        datosReporte = await generarReporteCompleto(
          periodoId,
          fechaInicio,
          fechaFin
        );
        nombreArchivo = `Reporte_Completo_${
          datosReporte.periodo_nombre || "Personalizado"
        }.xlsx`;
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de reporte no válido" },
          { status: 400 }
        );
    }

    // Generar archivo Excel
    const archivoExcel = generarArchivoExcel(datosReporte, tipoReporte);

    // Enviar archivo como respuesta
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );

    return new NextResponse(archivoExcel, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error generando reporte:", error);
    return NextResponse.json(
      { error: "Error generando reporte: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Vista previa de datos del reporte (sin generar archivo)
export async function POST(request) {
  try {
    const datos = await request.json();
    const { tipo, periodo_id, fecha_inicio, fecha_fin } = datos;

    let datosReporte;

    switch (tipo) {
      case "general":
        datosReporte = await generarReporteGeneral(
          periodo_id,
          fecha_inicio,
          fecha_fin
        );
        break;
      case "efectivo":
      case "tarjeta":
      case "transferencia":
        datosReporte = await generarReportePorMetodo(
          tipo,
          periodo_id,
          fecha_inicio,
          fecha_fin
        );
        break;
      case "todos":
        datosReporte = await generarReporteCompleto(
          periodo_id,
          fecha_inicio,
          fecha_fin
        );
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de reporte no válido" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...datosReporte,
      mensaje: "Vista previa generada exitosamente",
    });
  } catch (error) {
    console.error("Error generando vista previa:", error);
    return NextResponse.json(
      { error: "Error generando vista previa: " + error.message },
      { status: 500 }
    );
  }
}

// === FUNCIONES AUXILIARES ===

async function generarReporteGeneral(periodoId, fechaInicio, fechaFin) {
  // Construir consulta base
  let whereClause = "";
  let parametros = [];
  let periodoNombre = "Personalizado";

  if (periodoId) {
    whereClause = "WHERE v.periodo_id = $1";
    parametros.push(periodoId);

    // Obtener nombre del período
    const consultaPeriodo =
      "SELECT nombre FROM periodos_contables WHERE id = $1";
    const periodo = await ejecutarConsulta(consultaPeriodo, [periodoId]);
    if (periodo.rows.length > 0) {
      periodoNombre = periodo.rows[0].nombre;
    }
  } else if (fechaInicio && fechaFin) {
    whereClause = "WHERE v.fecha_venta >= $1 AND v.fecha_venta <= $2";
    parametros.push(fechaInicio, fechaFin);
    periodoNombre = `${fechaInicio} a ${fechaFin}`;
  }

  // Consulta principal de ventas
  const consultaVentas = `
    SELECT 
      v.numero_venta,
      v.fecha_venta,
      c.nombre_completo as cliente,
      c.expediente,
      c.email,
      c.celular,
      v.marca_armazon,
      v.laboratorio,
      v.precio_armazon,
      v.precio_micas,
      v.costo_total,
      v.total_depositado,
      v.saldo_restante,
      v.estado,
      v.fecha_llegada_laboratorio,
      v.fecha_entrega_cliente,
      v.notas,
      p.nombre as periodo
    FROM ventas v
    INNER JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN periodos_contables p ON v.periodo_id = p.id
    ${whereClause}
    ORDER BY v.fecha_venta DESC, v.numero_venta
  `;

  const resultadoVentas = await ejecutarConsulta(consultaVentas, parametros);

  // Consulta de depósitos del período
  const consultaDepositos = `
    SELECT 
      d.fecha_deposito,
      d.monto,
      d.metodo_pago,
      d.notas as deposito_notas,
      v.numero_venta,
      c.nombre_completo as cliente
    FROM depositos d
    INNER JOIN ventas v ON d.venta_id = v.id
    INNER JOIN clientes c ON v.cliente_id = c.id
    ${whereClause
      .replace("v.periodo_id", "v.periodo_id")
      .replace("v.fecha_venta", "v.fecha_venta")}
    ORDER BY d.fecha_deposito DESC, v.numero_venta
  `;

  const resultadoDepositos = await ejecutarConsulta(
    consultaDepositos,
    parametros
  );

  // Calcular estadísticas
  const estadisticas = calcularEstadisticas(
    resultadoVentas.rows,
    resultadoDepositos.rows
  );

  return {
    periodo_nombre: periodoNombre,
    ventas: resultadoVentas.rows,
    depositos: resultadoDepositos.rows,
    estadisticas,
    fecha_generacion: new Date().toISOString(),
  };
}

async function generarReportePorMetodo(
  metodoPago,
  periodoId,
  fechaInicio,
  fechaFin
) {
  // Obtener reporte general primero
  const reporteGeneral = await generarReporteGeneral(
    periodoId,
    fechaInicio,
    fechaFin
  );

  // Filtrar depósitos por método de pago
  const depositosFiltrados = reporteGeneral.depositos.filter(
    (d) => d.metodo_pago === metodoPago
  );

  // Obtener ventas que tienen depósitos de este método
  const ventasConDepositos = reporteGeneral.ventas.filter((venta) =>
    depositosFiltrados.some(
      (deposito) => deposito.numero_venta === venta.numero_venta
    )
  );

  // Calcular estadísticas específicas del método
  const estadisticasMetodo = {
    total_depositos: depositosFiltrados.length,
    monto_total_metodo: depositosFiltrados.reduce(
      (sum, d) => sum + parseFloat(d.monto),
      0
    ),
    ventas_con_metodo: ventasConDepositos.length,
    porcentaje_del_total:
      reporteGeneral.estadisticas.total_depositado > 0
        ? (depositosFiltrados.reduce((sum, d) => sum + parseFloat(d.monto), 0) /
            reporteGeneral.estadisticas.total_depositado) *
          100
        : 0,
  };

  return {
    periodo_nombre: reporteGeneral.periodo_nombre,
    metodo_pago: metodoPago,
    ventas: ventasConDepositos,
    depositos: depositosFiltrados,
    estadisticas: estadisticasMetodo,
    estadisticas_generales: reporteGeneral.estadisticas,
    fecha_generacion: new Date().toISOString(),
  };
}

async function generarReporteCompleto(periodoId, fechaInicio, fechaFin) {
  const reporteGeneral = await generarReporteGeneral(
    periodoId,
    fechaInicio,
    fechaFin
  );

  const reporteEfectivo = await generarReportePorMetodo(
    "efectivo",
    periodoId,
    fechaInicio,
    fechaFin
  );
  const reporteTarjeta = await generarReportePorMetodo(
    "tarjeta",
    periodoId,
    fechaInicio,
    fechaFin
  );
  const reporteTransferencia = await generarReportePorMetodo(
    "transferencia",
    periodoId,
    fechaInicio,
    fechaFin
  );

  return {
    periodo_nombre: reporteGeneral.periodo_nombre,
    general: reporteGeneral,
    efectivo: reporteEfectivo,
    tarjeta: reporteTarjeta,
    transferencia: reporteTransferencia,
    fecha_generacion: new Date().toISOString(),
  };
}

function calcularEstadisticas(ventas, depositos) {
  const stats = {
    total_ventas: ventas.length,
    total_vendido: ventas.reduce(
      (sum, v) => sum + parseFloat(v.costo_total || 0),
      0
    ),
    total_depositado: depositos.reduce(
      (sum, d) => sum + parseFloat(d.monto || 0),
      0
    ),
    total_pendiente: ventas.reduce(
      (sum, v) => sum + parseFloat(v.saldo_restante || 0),
      0
    ),

    // Por estado
    ventas_por_estado: {
      pendiente: ventas.filter((v) => v.estado === "pendiente").length,
      en_laboratorio: ventas.filter((v) => v.estado === "en_laboratorio")
        .length,
      listo: ventas.filter((v) => v.estado === "listo").length,
      entregado: ventas.filter((v) => v.estado === "entregado").length,
      cancelado: ventas.filter((v) => v.estado === "cancelado").length,
    },

    // Por método de pago
    depositos_por_metodo: {
      efectivo: depositos
        .filter((d) => d.metodo_pago === "efectivo")
        .reduce((sum, d) => sum + parseFloat(d.monto), 0),
      tarjeta: depositos
        .filter((d) => d.metodo_pago === "tarjeta")
        .reduce((sum, d) => sum + parseFloat(d.monto), 0),
      transferencia: depositos
        .filter((d) => d.metodo_pago === "transferencia")
        .reduce((sum, d) => sum + parseFloat(d.monto), 0),
    },

    // Por laboratorio
    ventas_por_laboratorio: {},
  };

  // Calcular ventas por laboratorio
  ventas.forEach((venta) => {
    const lab = venta.laboratorio || "Sin laboratorio";
    stats.ventas_por_laboratorio[lab] =
      (stats.ventas_por_laboratorio[lab] || 0) + 1;
  });

  return stats;
}

function generarArchivoExcel(datos, tipoReporte) {
  const workbook = XLSX.utils.book_new();

  if (tipoReporte === "todos") {
    // Reporte completo - múltiples hojas

    // Hoja 1: Resumen General
    const resumen = generarHojaResumen(datos);
    XLSX.utils.book_append_sheet(workbook, resumen, "Resumen");

    // Hoja 2: Todas las ventas
    const ventasSheet = generarHojaVentas(
      datos.general.ventas,
      "Todas las Ventas"
    );
    XLSX.utils.book_append_sheet(workbook, ventasSheet, "Todas las Ventas");

    // Hoja 3: Depósitos Efectivo
    if (datos.efectivo.depositos.length > 0) {
      const efectivoSheet = generarHojaDepositos(
        datos.efectivo.depositos,
        "Efectivo"
      );
      XLSX.utils.book_append_sheet(workbook, efectivoSheet, "Efectivo");
    }

    // Hoja 4: Depósitos Tarjeta
    if (datos.tarjeta.depositos.length > 0) {
      const tarjetaSheet = generarHojaDepositos(
        datos.tarjeta.depositos,
        "Tarjeta"
      );
      XLSX.utils.book_append_sheet(workbook, tarjetaSheet, "Tarjeta");
    }

    // Hoja 5: Depósitos Transferencia
    if (datos.transferencia.depositos.length > 0) {
      const transferenciaSheet = generarHojaDepositos(
        datos.transferencia.depositos,
        "Transferencia"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        transferenciaSheet,
        "Transferencia"
      );
    }
  } else if (tipoReporte === "general") {
    // Solo ventas
    const ventasSheet = generarHojaVentas(datos.ventas, "Reporte de Ventas");
    XLSX.utils.book_append_sheet(workbook, ventasSheet, "Ventas");
  } else {
    // Reporte específico por método de pago
    const depositosSheet = generarHojaDepositos(
      datos.depositos,
      `Depósitos ${datos.metodo_pago}`
    );
    XLSX.utils.book_append_sheet(workbook, depositosSheet, datos.metodo_pago);
  }

  // Generar buffer del archivo
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

function generarHojaResumen(datos) {
  const resumenData = [
    ["REPORTE DE VENTAS - SISTEMA ÓPTICA"],
    [`Período: ${datos.periodo_nombre}`],
    [
      `Fecha de generación: ${new Date(datos.fecha_generacion).toLocaleString(
        "es-MX"
      )}`,
    ],
    [""],
    ["RESUMEN GENERAL"],
    ["Total de ventas:", datos.general.estadisticas.total_ventas],
    [
      "Monto total vendido:",
      `$${datos.general.estadisticas.total_vendido.toFixed(2)}`,
    ],
    [
      "Total depositado:",
      `$${datos.general.estadisticas.total_depositado.toFixed(2)}`,
    ],
    [
      "Total pendiente cobro:",
      `$${datos.general.estadisticas.total_pendiente.toFixed(2)}`,
    ],
    [""],
    ["DEPÓSITOS POR MÉTODO DE PAGO"],
    [
      "Efectivo:",
      `$${datos.general.estadisticas.depositos_por_metodo.efectivo.toFixed(2)}`,
    ],
    [
      "Tarjeta:",
      `$${datos.general.estadisticas.depositos_por_metodo.tarjeta.toFixed(2)}`,
    ],
    [
      "Transferencia:",
      `$${datos.general.estadisticas.depositos_por_metodo.transferencia.toFixed(
        2
      )}`,
    ],
    [""],
    ["VENTAS POR ESTADO"],
    ["Pendiente:", datos.general.estadisticas.ventas_por_estado.pendiente],
    [
      "En Laboratorio:",
      datos.general.estadisticas.ventas_por_estado.en_laboratorio,
    ],
    ["Listo:", datos.general.estadisticas.ventas_por_estado.listo],
    ["Entregado:", datos.general.estadisticas.ventas_por_estado.entregado],
    ["Cancelado:", datos.general.estadisticas.ventas_por_estado.cancelado],
  ];

  return XLSX.utils.aoa_to_sheet(resumenData);
}

function generarHojaVentas(ventas, titulo) {
  const headers = [
    "Número de Venta",
    "Fecha",
    "Cliente",
    "Expediente",
    "Email",
    "Celular",
    "Marca Armazón",
    "Laboratorio",
    "Precio Armazón",
    "Precio Micas",
    "Costo Total",
    "Total Depositado",
    "Saldo Restante",
    "Estado",
    "Fecha Llegada Lab",
    "Fecha Entrega",
    "Notas",
  ];

  const filas = ventas.map((venta) => [
    venta.numero_venta,
    venta.fecha_venta,
    venta.cliente,
    venta.expediente || "",
    venta.email || "",
    venta.celular || "",
    venta.marca_armazon || "",
    venta.laboratorio || "",
    parseFloat(venta.precio_armazon || 0),
    parseFloat(venta.precio_micas || 0),
    parseFloat(venta.costo_total),
    parseFloat(venta.total_depositado),
    parseFloat(venta.saldo_restante),
    venta.estado,
    venta.fecha_llegada_laboratorio || "",
    venta.fecha_entrega_cliente || "",
    venta.notas || "",
  ]);

  const data = [headers, ...filas];
  return XLSX.utils.aoa_to_sheet(data);
}

function generarHojaDepositos(depositos, titulo) {
  const headers = [
    "Fecha Depósito",
    "Número de Venta",
    "Cliente",
    "Monto",
    "Método de Pago",
    "Notas",
  ];

  const filas = depositos.map((deposito) => [
    deposito.fecha_deposito,
    deposito.numero_venta,
    deposito.cliente,
    parseFloat(deposito.monto),
    deposito.metodo_pago,
    deposito.deposito_notas || "",
  ]);

  const data = [headers, ...filas];
  return XLSX.utils.aoa_to_sheet(data);
}
