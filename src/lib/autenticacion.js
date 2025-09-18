import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { consultasUsuarios } from '@/lib/conexion-bd';

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-fallback-no-usar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAX_INTENTOS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const TIEMPO_BLOQUEO = parseInt(process.env.LOCKOUT_TIME_MINUTES) || 15;

// === FUNCIONES DE JWT ===

/**
 * Generar token JWT
 */
export function generarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'optica-sistema',
    audience: 'usuario-optica'
  });
}

/**
 * Verificar token JWT
 */
export function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'optica-sistema',
      audience: 'usuario-optica'
    });
  } catch (error) {
    throw new Error('Token inválido: ' + error.message);
  }
}

/**
 * Decodificar token sin verificar (para obtener datos expirados)
 */
export function decodificarToken(token) {
  return jwt.decode(token);
}

// === FUNCIONES DE HASHING ===

/**
 * Hashear contraseña
 */
export async function hashearPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verificar contraseña
 */
export async function verificarPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// === FUNCIONES DE AUTENTICACIÓN ===

/**
 * Autenticar usuario - Función principal de login
 */
export async function autenticarUsuario(nombreUsuario, password) {
  try {
    // 1. Obtener usuario de la base de datos
    const usuario = await consultasUsuarios.obtenerPorNombre(nombreUsuario);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    // 3. Verificar si el usuario está bloqueado
    if (usuario.bloqueado_hasta && new Date() < new Date(usuario.bloqueado_hasta)) {
      const minutosRestantes = Math.ceil(
        (new Date(usuario.bloqueado_hasta) - new Date()) / (1000 * 60)
      );
      throw new Error(`Usuario bloqueado. Intente en ${minutosRestantes} minutos.`);
    }

    // 4. Verificar contraseña
    const passwordValido = await verificarPassword(password, usuario.password_hash);
    
    if (!passwordValido) {
      // Incrementar intentos fallidos
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
      let bloqueoHasta = null;
      
      if (nuevosIntentos >= MAX_INTENTOS) {
        bloqueoHasta = new Date(Date.now() + (TIEMPO_BLOQUEO * 60 * 1000));
      }
      
      await consultasUsuarios.actualizarIntentos(usuario.id, nuevosIntentos, bloqueoHasta);
      
      if (bloqueoHasta) {
        throw new Error(`Demasiados intentos fallidos. Usuario bloqueado por ${TIEMPO_BLOQUEO} minutos.`);
      }
      
      throw new Error(`Contraseña incorrecta. ${MAX_INTENTOS - nuevosIntentos} intentos restantes.`);
    }

    // 5. Login exitoso - resetear intentos
    if (usuario.intentos_fallidos > 0) {
      await consultasUsuarios.resetearIntentos(usuario.id);
    }

    // 6. Generar token JWT
    const payload = {
      id: usuario.id,
      nombreUsuario: usuario.nombre_usuario,
      nombreCompleto: usuario.nombre_completo
    };

    const token = generarToken(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombre_usuario,
        nombreCompleto: usuario.nombre_completo
      }
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Verificar token y obtener usuario
 */
export async function obtenerUsuarioDeToken(token) {
  try {
    const payload = verificarToken(token);
    const usuario = await consultasUsuarios.obtenerPorNombre(payload.nombreUsuario);
    
    if (!usuario || !usuario.activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    return {
      id: usuario.id,
      nombreUsuario: usuario.nombre_usuario,
      nombreCompleto: usuario.nombre_completo
    };
  } catch (error) {
    throw new Error('Token inválido o usuario no encontrado');
  }
}

// === MIDDLEWARE DE VALIDACIÓN ===

/**
 * Validar datos de login
 */
export function validarDatosLogin(nombreUsuario, password) {
  const errores = [];

  if (!nombreUsuario || nombreUsuario.trim().length === 0) {
    errores.push('Nombre de usuario requerido');
  }

  if (!password || password.length === 0) {
    errores.push('Contraseña requerida');
  }

  if (nombreUsuario && nombreUsuario.length < 3) {
    errores.push('Nombre de usuario debe tener al menos 3 caracteres');
  }

  if (password && password.length < 6) {
    errores.push('Contraseña debe tener al menos 6 caracteres');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

// === UTILIDADES DE SEGURIDAD ===

/**
 * Generar número de expediente único
 */
export function generarNumeroExpediente() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  
  return `EXP-${año}${mes}${dia}-${timestamp}`;
}

/**
 * Generar número de venta único
 */
export function generarNumeroVenta() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  
  return `VTA-${año}${mes}${dia}-${timestamp}`;
}

/**
 * Validar formato de email
 */
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar formato de teléfono
 */
export function validarTelefono(telefono) {
  const regex = /^[\d\s\-\(\)\+]+$/;
  return regex.test(telefono) && telefono.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitizar entrada de texto
 */
export function sanitizarTexto(texto) {
  if (!texto) return texto;
  return texto.trim().replace(/[<>\"']/g, '');
}

/**
 * Validar y formatear fecha
 */
export function validarFecha(fecha) {
  if (!fecha) return null;
  const fechaObj = new Date(fecha);
  return isNaN(fechaObj.getTime()) ? null : fechaObj;
}

export default {
  generarToken,
  verificarToken,
  hashearPassword,
  verificarPassword,
  autenticarUsuario,
  obtenerUsuarioDeToken,
  validarDatosLogin,
  generarNumeroExpediente,
  generarNumeroVenta,
  validarEmail,
  validarTelefono,
  sanitizarTexto,
  validarFecha
};