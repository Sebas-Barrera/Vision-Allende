import { parsearDinero, restarDinero, sumarDinero } from "@/lib/dinero-utils";
// === VALIDACIONES PARA SISTEMA ÓPTICA ===

/**
 * Función base para validar un esquema
 */
function validarEsquema(datos, esquema) {
  const errores = {};
  let esValido = true;

  for (const [campo, reglas] of Object.entries(esquema)) {
    const valor = datos[campo];
    const erroresCampo = [];

    // Verificar si es requerido
    if (
      reglas.requerido &&
      (!valor || (typeof valor === "string" && valor.trim() === ""))
    ) {
      erroresCampo.push(reglas.mensajeRequerido || `${campo} es requerido`);
    }

    // Si el campo está vacío y no es requerido, continuar
    if (!valor && !reglas.requerido) continue;

    // Validar tipo
    if (valor && reglas.tipo) {
      if (
        reglas.tipo === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
      ) {
        erroresCampo.push("Formato de email inválido");
      }

      if (reglas.tipo === "numero" && isNaN(parseFloat(valor))) {
        erroresCampo.push("Debe ser un número válido");
      }

      if (reglas.tipo === "fecha" && isNaN(new Date(valor).getTime())) {
        erroresCampo.push("Debe ser una fecha válida");
      }

      if (
        reglas.tipo === "telefono" &&
        !/^\d{10}$/.test(valor.replace(/\D/g, ""))
      ) {
        erroresCampo.push("Debe ser un teléfono de 10 dígitos");
      }
    }

    // Validar longitud mínima
    if (valor && reglas.minimo && valor.toString().length < reglas.minimo) {
      erroresCampo.push(`Debe tener al menos ${reglas.minimo} caracteres`);
    }

    // Validar longitud máxima
    if (valor && reglas.maximo && valor.toString().length > reglas.maximo) {
      erroresCampo.push(`No debe exceder ${reglas.maximo} caracteres`);
    }

    // Validar rango numérico
    if (valor && reglas.tipo === "numero") {
      const num = parseFloat(valor);
      if (reglas.valorMinimo && num < reglas.valorMinimo) {
        erroresCampo.push(`Debe ser mayor o igual a ${reglas.valorMinimo}`);
      }
      if (reglas.valorMaximo && num > reglas.valorMaximo) {
        erroresCampo.push(`Debe ser menor o igual a ${reglas.valorMaximo}`);
      }
    }

    // Validar opciones permitidas
    if (valor && reglas.opciones && !reglas.opciones.includes(valor)) {
      erroresCampo.push(
        `Debe ser una de las opciones: ${reglas.opciones.join(", ")}`
      );
    }

    // Validación personalizada
    if (valor && reglas.validacionPersonalizada) {
      const resultadoPersonalizado = reglas.validacionPersonalizada(valor);
      if (resultadoPersonalizado !== true) {
        erroresCampo.push(resultadoPersonalizado);
      }
    }

    if (erroresCampo.length > 0) {
      errores[campo] = erroresCampo;
      esValido = false;
    }
  }

  return { esValido, errores };
}

// === ESQUEMAS DE VALIDACIÓN ===

/**
 * Esquema para validar datos de login
 */
export const esquemaLogin = {
  nombreUsuario: {
    requerido: true,
    minimo: 3,
    maximo: 50,
    mensajeRequerido: "Nombre de usuario es requerido",
  },
  password: {
    requerido: true,
    minimo: 6,
    mensajeRequerido: "Contraseña es requerida",
  },
};

/**
 * Esquema para validar datos de cliente
 */
export const esquemaCliente = {
  nombre_completo: {
    requerido: true,
    minimo: 2,
    maximo: 100,
    mensajeRequerido: "Nombre completo es requerido",
  },
  expediente: {
    requerido: false,
    maximo: 20,
  },
  fecha_nacimiento: {
    requerido: false,
    tipo: "fecha",
  },
  edad: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 1,
    valorMaximo: 120,
  },
  ocupacion: {
    requerido: false,
    maximo: 100,
  },
  direccion: {
    requerido: false,
    maximo: 500,
  },
  email: {
    requerido: false,
    tipo: "email",
    maximo: 100,
  },
  telefono: {
    requerido: false,
    tipo: "telefono",
  },
  celular: {
    requerido: false,
    tipo: "telefono",
  },
  peso: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 1,
    valorMaximo: 500,
  },
  talla: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0.5,
    valorMaximo: 3,
  },
  fr: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 1,
    valorMaximo: 100,
  },
  temperatura: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 30,
    valorMaximo: 45,
  },
  saturacion_oxigeno: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 50,
    valorMaximo: 100,
  },
  ritmo_cardiaco: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 30,
    valorMaximo: 200,
  },
};

/**
 * Esquema para validar datos de graduación
 */
/**
 * Esquema para validar datos de graduación
 */
export const esquemaGraduacion = {
  cliente_id: {
    requerido: true,
    mensajeRequerido: "Cliente es requerido",
  },
  tipo: {
    requerido: true,
    opciones: ["lejos", "cerca"],
    mensajeRequerido: "Tipo de graduación es requerido",
  },
  od_esfera: {
    requerido: false,
    tipo: "numero",
    valorMinimo: -30,
    valorMaximo: 30,
  },
  od_cilindro: {
    requerido: false,
    tipo: "numero",
    valorMinimo: -10,
    valorMaximo: 10,
  },
  od_eje: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
    valorMaximo: 180,
  },
  od_adicion: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
    valorMaximo: 5,
  },
  oi_esfera: {
    requerido: false,
    tipo: "numero",
    valorMinimo: -30,
    valorMaximo: 30,
  },
  oi_cilindro: {
    requerido: false,
    tipo: "numero",
    valorMinimo: -10,
    valorMaximo: 10,
  },
  oi_eje: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
    valorMaximo: 180,
  },
  oi_adicion: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
    valorMaximo: 5,
  },
  fecha_examen: {
    requerido: false,
    tipo: "fecha",
  },
};

/**
 * Esquema para validar datos de venta
 */
export const esquemaVenta = {
  cliente_id: {
    requerido: true,
    mensajeRequerido: "Cliente es requerido",
  },
  marca_armazon: {
    requerido: false,
    maximo: 100,
  },
  laboratorio: {
    requerido: false,
    opciones: ["Essilor", "Augen", "Eva"],
  },
  precio_armazon: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
  },
  precio_micas: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
  },
  costo_total: {
    requerido: true,
    tipo: "numero",
    valorMinimo: 0.01,
    mensajeRequerido: "Costo total es requerido",
  },
  deposito_inicial: {
    requerido: false,
    tipo: "numero",
    valorMinimo: 0,
  },
  estado: {
    requerido: false,
    opciones: [
      "pendiente",
      "en_laboratorio",
      "listo",
      "entregado",
      "cancelado",
    ],
  },
  fecha_venta: {
    requerido: false,
    tipo: "fecha",
  },
  fecha_llegada_laboratorio: {
    requerido: false,
    tipo: "fecha",
  },
  fecha_entrega_cliente: {
    requerido: false,
    tipo: "fecha",
  },
};

/**
 * Esquema para validar datos de depósito
 */
export const esquemaDeposito = {
  venta_id: {
    requerido: true,
    mensajeRequerido: "Venta es requerida",
  },
  monto: {
    requerido: true,
    tipo: "numero",
    valorMinimo: 0.01,
    mensajeRequerido: "Monto es requerido",
  },
  metodo_pago: {
    requerido: true,
    opciones: ["efectivo", "tarjeta", "transferencia"],
    mensajeRequerido: "Método de pago es requerido",
  },
  fecha_deposito: {
    requerido: false,
    tipo: "fecha",
  },
};

// === FUNCIONES DE VALIDACIÓN ESPECÍFICAS ===

/**
 * Validar datos de login
 */
export function validarLogin(datos) {
  return validarEsquema(datos, esquemaLogin);
}

/**
 * Validar datos de cliente
 */
export function validarCliente(datos) {
  const resultado = validarEsquema(datos, esquemaCliente);

  // Validación adicional: si hay peso y talla, calcular IMC
  if (datos.peso && datos.talla) {
    const imc = datos.peso / (datos.talla * datos.talla);
    if (imc < 10 || imc > 50) {
      if (!resultado.errores.peso) resultado.errores.peso = [];
      resultado.errores.peso.push("Peso y talla parecen inconsistentes");
      resultado.esValido = false;
    }
  }

  return resultado;
}

/**
 * Validar datos de graduación
 */
export function validarGraduacion(datos) {
  const resultado = validarEsquema(datos, esquemaGraduacion);

  // Validación adicional: si hay cilindro, debe haber eje
  if (datos.od_cilindro && datos.od_cilindro !== 0 && !datos.od_eje) {
    if (!resultado.errores.od_eje) resultado.errores.od_eje = [];
    resultado.errores.od_eje.push("Eje requerido cuando hay cilindro");
    resultado.esValido = false;
  }

  if (datos.oi_cilindro && datos.oi_cilindro !== 0 && !datos.oi_eje) {
    if (!resultado.errores.oi_eje) resultado.errores.oi_eje = [];
    resultado.errores.oi_eje.push("Eje requerido cuando hay cilindro");
    resultado.esValido = false;
  }

  return resultado;
}

/**
 * Validar datos de venta
 */
export function validarVenta(datos) {
  const resultado = validarEsquema(datos, esquemaVenta);

  // Validación adicional: costo total debe ser suma de armazón + micas
  if (datos.precio_armazon && datos.precio_micas && datos.costo_total) {
    const suma = sumarDinero(datos.precio_armazon, datos.precio_micas);
    const total = parsearDinero(datos.costo_total);

    if (Math.abs(suma - total) > 0.01) {
      if (!resultado.errores.costo_total) resultado.errores.costo_total = [];
      resultado.errores.costo_total.push(
        "Costo total debe coincidir con suma de armazón + micas"
      );
      resultado.esValido = false;
    }
  }

  return resultado;
}

/**
 * Validar datos de depósito
 */
export function validarDeposito(datos, costoTotalVenta, totalDepositado = 0) {
  const resultado = validarEsquema(datos, esquemaDeposito);

  // Validación adicional: depósito no puede exceder el saldo restante
  if (datos.monto && costoTotalVenta) {
    const costoTotal = parsearDinero(costoTotalVenta);
    const totalDepositadoParsed = parsearDinero(totalDepositado);
    const saldoRestante = restarDinero(costoTotal, totalDepositadoParsed);
    const montoDeposito = parsearDinero(datos.monto);

    if (montoDeposito > saldoRestante && saldoRestante > 0.01) {
      if (!resultado.errores.monto) resultado.errores.monto = [];
      resultado.errores.monto.push(
        `El depósito no puede exceder el saldo restante ($${saldoRestante.toFixed(
          2
        )})`
      );
      resultado.esValido = false;
    }

    // Validación: el depósito debe ser positivo
    if (montoDeposito <= 0) {
      if (!resultado.errores.monto) resultado.errores.monto = [];
      resultado.errores.monto.push("El monto debe ser mayor a cero");
      resultado.esValido = false;
    }
  }

  return resultado;
}

// === UTILIDADES DE VALIDACIÓN ===

/**
 * Limpiar datos eliminando campos vacíos
 */
export function limpiarDatos(datos) {
  const datosLimpios = {};

  for (const [clave, valor] of Object.entries(datos)) {
    if (valor !== null && valor !== undefined && valor !== "") {
      // Para strings, limpiar espacios
      if (typeof valor === "string") {
        const valorLimpio = valor.trim();
        if (valorLimpio !== "") {
          datosLimpios[clave] = valorLimpio;
        }
      } else {
        datosLimpios[clave] = valor;
      }
    }
  }

  return datosLimpios;
}

/**
 * Convertir tipos de datos según esquema
 */
export function convertirTipos(datos, esquema) {
  const datosConvertidos = { ...datos };

  for (const [campo, reglas] of Object.entries(esquema)) {
    if (datosConvertidos[campo] && reglas.tipo) {
      const valor = datosConvertidos[campo];

      if (reglas.tipo === "numero" && typeof valor === "string") {
        const numero = parseFloat(valor);
        if (!isNaN(numero)) {
          datosConvertidos[campo] = numero;
        }
      }

      if (reglas.tipo === "fecha" && typeof valor === "string") {
        const fecha = new Date(valor);
        if (!isNaN(fecha.getTime())) {
          datosConvertidos[campo] = fecha;
        }
      }
    }
  }

  return datosConvertidos;
}

/**
 * Obtener errores en formato plano
 */
export function obtenerErroresPlanos(errores) {
  const erroresPlanos = [];

  for (const [campo, erroresCampo] of Object.entries(errores)) {
    erroresCampo.forEach((error) => {
      erroresPlanos.push(`${campo}: ${error}`);
    });
  }

  return erroresPlanos;
}

export default {
  validarLogin,
  validarCliente,
  validarGraduacion,
  validarVenta,
  validarDeposito,
  limpiarDatos,
  convertirTipos,
  obtenerErroresPlanos,
};
