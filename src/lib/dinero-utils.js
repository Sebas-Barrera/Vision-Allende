// PASO 1: Crea un nuevo archivo /src/lib/dinero-utils.js

/**
 * Función para manejar dinero de forma precisa
 * Evita errores de precisión de punto flotante
 */
export function parsearDinero(valor) {
  if (!valor || valor === "" || isNaN(valor)) {
    return 0;
  }

  // Convertir a string para manejar de forma segura
  const valorString = String(valor);

  // Parsear a número y usar Math.round para evitar problemas de precisión
  const numero = parseFloat(valorString);

  // Redondear a 2 decimales usando multiplicación para evitar errores de punto flotante
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

/**
 * Formatear dinero para mostrar
 */
export function formatearDinero(valor) {
  const valorLimpio = parsearDinero(valor);
  return valorLimpio.toFixed(2);
}

/**
 * Sumar valores monetarios de forma segura
 */
export function sumarDinero(...valores) {
  const suma = valores.reduce((total, valor) => {
    return total + parsearDinero(valor);
  }, 0);

  return Math.round((suma + Number.EPSILON) * 100) / 100;
}

/**
 * Restar valores monetarios de forma segura
 */
export function restarDinero(valor1, valor2) {
  const diferencia = parsearDinero(valor1) - parsearDinero(valor2);
  return Math.round((diferencia + Number.EPSILON) * 100) / 100;
}
