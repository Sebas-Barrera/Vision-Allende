// === UTILIDADES DE FECHAS ===

/**
 * Formatear fecha para mostrar en interfaz
 */
export function formatearFecha(fecha, opciones = {}) {
  if (!fecha) return '';
  
  const fechaObj = new Date(fecha);
  const configuracion = {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    ...opciones
  };
  
  return fechaObj.toLocaleDateString('es-MX', configuracion);
}

/**
 * Formatear fecha corta (dd/mm/yyyy)
 */
export function formatearFechaCorta(fecha) {
  if (!fecha) return '';
  const fechaObj = new Date(fecha);
  return fechaObj.toLocaleDateString('es-MX');
}

/**
 * Formatear fecha para input HTML
 */
export function formatearFechaInput(fecha) {
  if (!fecha) return '';
  const fechaObj = new Date(fecha);
  return fechaObj.toISOString().split('T')[0];
}

/**
 * Obtener nombre del mes
 */
export function obtenerNombreMes(numeroMes) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[numeroMes - 1] || '';
}

/**
 * Generar nombre de período contable
 */
export function generarNombrePeriodo(fechaInicio) {
  const fecha = new Date(fechaInicio);
  const mesActual = obtenerNombreMes(fecha.getMonth() + 1);
  const mesSiguiente = obtenerNombreMes(fecha.getMonth() + 2);
  return `${mesActual} / ${mesSiguiente}`;
}

// === UTILIDADES DE NÚMEROS ===

/**
 * Formatear dinero en pesos mexicanos
 */
export function formatearDinero(cantidad, incluirSimbolo = true) {
  if (cantidad === null || cantidad === undefined) return '$0.00';
  
  const numero = parseFloat(cantidad);
  const formateado = numero.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return incluirSimbolo ? `$${formateado}` : formateado;
}

/**
 * Calcular IMC (Índice de Masa Corporal)
 */
export function calcularIMC(peso, talla) {
  if (!peso || !talla || peso <= 0 || talla <= 0) return null;
  
  const imc = peso / (talla * talla);
  return Math.round(imc * 100) / 100;
}

/**
 * Interpretar IMC
 */
export function interpretarIMC(imc) {
  if (!imc) return '';
  
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

/**
 * Calcular edad desde fecha de nacimiento
 */
export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

// === UTILIDADES DE TEXTO ===

/**
 * Capitalizar primera letra
 */
export function capitalizarPrimera(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Capitalizar cada palabra
 */
export function capitalizarPalabras(texto) {
  if (!texto) return '';
  return texto.split(' ')
    .map(palabra => capitalizarPrimera(palabra))
    .join(' ');
}

/**
 * Limpiar y formatear nombre completo
 */
export function formatearNombreCompleto(nombre) {
  if (!nombre) return '';
  return capitalizarPalabras(nombre.trim());
}

/**
 * Generar iniciales
 */
export function generarIniciales(nombre) {
  if (!nombre) return '';
  return nombre.split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Truncar texto
 */
export function truncarTexto(texto, longitud = 50) {
  if (!texto) return '';
  return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
}

// === UTILIDADES DE ESTADO ===

/**
 * Obtener configuración de estado de venta
 */
export function obtenerEstadoVenta(estado) {
  const estados = {
    pendiente: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icono: '⏳'
    },
    en_laboratorio: {
      label: 'En Laboratorio',
      color: 'bg-blue-100 text-blue-800',
      icono: '🔬'
    },
    listo: {
      label: 'Listo',
      color: 'bg-green-100 text-green-800',
      icono: '✅'
    },
    entregado: {
      label: 'Entregado',
      color: 'bg-gray-100 text-gray-800',
      icono: '📦'
    },
    cancelado: {
      label: 'Cancelado',
      color: 'bg-red-100 text-red-800',
      icono: '❌'
    }
  };
  
  return estados[estado] || estados.pendiente;
}

/**
 * Obtener configuración de método de pago
 */
export function obtenerMetodoPago(metodo) {
  const metodos = {
    efectivo: {
      label: 'Efectivo',
      color: 'bg-green-100 text-green-800',
      icono: '💵'
    },
    tarjeta: {
      label: 'Tarjeta',
      color: 'bg-blue-100 text-blue-800',
      icono: '💳'
    },
    transferencia: {
      label: 'Transferencia',
      color: 'bg-purple-100 text-purple-800',
      icono: '🏦'
    }
  };
  
  return metodos[metodo] || metodos.efectivo;
}

// === UTILIDADES DE VALIDACIÓN ===

/**
 * Validar número de teléfono mexicano
 */
export function validarTelefonoMexicano(telefono) {
  if (!telefono) return false;
  const limpio = telefono.replace(/\D/g, '');
  return limpio.length === 10 || (limpio.length === 12 && limpio.startsWith('52'));
}

/**
 * Formatear número de teléfono
 */
export function formatearTelefono(telefono) {
  if (!telefono) return '';
  const limpio = telefono.replace(/\D/g, '');
  
  if (limpio.length === 10) {
    return limpio.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return telefono;
}

/**
 * Validar CURP mexicano (básico)
 */
export function validarCURP(curp) {
  if (!curp) return false;
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
  return regex.test(curp.toUpperCase());
}

// === UTILIDADES DE ARCHIVOS ===

/**
 * Obtener extensión de archivo
 */
export function obtenerExtension(nombreArchivo) {
  return nombreArchivo.split('.').pop().toLowerCase();
}

/**
 * Validar tipo de imagen
 */
export function esImagenValida(archivo) {
  const tiposPermitidos = ['jpg', 'jpeg', 'png', 'gif'];
  const extension = obtenerExtension(archivo.name);
  return tiposPermitidos.includes(extension);
}

/**
 * Formatear tamaño de archivo
 */
export function formatearTamañoArchivo(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
}

// === UTILIDADES DE URL ===

/**
 * Generar URL de imagen segura
 */
export function generarUrlImagen(rutaImagen, fallback = '/images/placeholder.png') {
  if (!rutaImagen) return fallback;
  
  if (rutaImagen.startsWith('http')) {
    return rutaImagen;
  }
  
  return `/uploads/${rutaImagen}`;
}

// === UTILIDADES DE BÚSQUEDA ===

/**
 * Normalizar texto para búsqueda
 */
export function normalizarParaBusqueda(texto) {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, '') // Quitar caracteres especiales
    .trim();
}

/**
 * Filtrar array por texto de búsqueda
 */
export function filtrarPorBusqueda(array, busqueda, campos) {
  if (!busqueda || busqueda.trim() === '') return array;
  
  const busquedaNormalizada = normalizarParaBusqueda(busqueda);
  
  return array.filter(item => {
    return campos.some(campo => {
      const valor = item[campo];
      if (!valor) return false;
      
      const valorNormalizado = normalizarParaBusqueda(valor.toString());
      return valorNormalizado.includes(busquedaNormalizada);
    });
  });
}

// === UTILIDADES DE PAGINACIÓN ===

/**
 * Calcular información de paginación
 */
export function calcularPaginacion(totalElementos, elementosPorPagina, paginaActual = 1) {
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);
  const inicio = (paginaActual - 1) * elementosPorPagina;
  const fin = Math.min(inicio + elementosPorPagina, totalElementos);
  
  return {
    totalElementos,
    totalPaginas,
    paginaActual: Math.max(1, Math.min(paginaActual, totalPaginas)),
    elementosPorPagina,
    inicio,
    fin,
    tienePaginaAnterior: paginaActual > 1,
    tienePaginaSiguiente: paginaActual < totalPaginas
  };
}

// === UTILIDADES DE LOCAL STORAGE (para configuraciones locales) ===

/**
 * Guardar configuración local
 */
export function guardarConfigLocal(clave, valor) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`optica_${clave}`, JSON.stringify(valor));
  }
}

/**
 * Obtener configuración local
 */
export function obtenerConfigLocal(clave, valorPorDefecto = null) {
  if (typeof window === 'undefined') return valorPorDefecto;
  
  try {
    const item = localStorage.getItem(`optica_${clave}`);
    return item ? JSON.parse(item) : valorPorDefecto;
  } catch (error) {
    return valorPorDefecto;
  }
}

// Exportar todas las utilidades como default
export default {
  // Fechas
  formatearFecha,
  formatearFechaCorta,
  formatearFechaInput,
  obtenerNombreMes,
  generarNombrePeriodo,
  
  // Números
  formatearDinero,
  calcularIMC,
  interpretarIMC,
  calcularEdad,
  
  // Texto
  capitalizarPrimera,
  capitalizarPalabras,
  formatearNombreCompleto,
  generarIniciales,
  truncarTexto,
  
  // Estado
  obtenerEstadoVenta,
  obtenerMetodoPago,
  
  // Validación
  validarTelefonoMexicano,
  formatearTelefono,
  validarCURP,
  
  // Archivos
  obtenerExtension,
  esImagenValida,
  formatearTamañoArchivo,
  generarUrlImagen,
  
  // Búsqueda
  normalizarParaBusqueda,
  filtrarPorBusqueda,
  calcularPaginacion,
  
  // Configuración
  guardarConfigLocal,
  obtenerConfigLocal
};