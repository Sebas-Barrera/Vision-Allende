import { NextResponse } from 'next/server'
import { autenticarUsuario, validarDatosLogin } from '@/lib/autenticacion'
import { verificarConexion } from '@/lib/conexion-bd'

// Manejar intentos de login por IP (simple rate limiting)
const intentosPorIP = new Map()
const LIMITE_INTENTOS = 5
const TIEMPO_BLOQUEO = 15 * 60 * 1000 // 15 minutos

function verificarLimiteIntentos(ip) {
  const ahora = Date.now()
  const datosIP = intentosPorIP.get(ip)

  if (!datosIP) {
    intentosPorIP.set(ip, { intentos: 1, ultimoIntento: ahora })
    return true
  }

  // Si han pasado más de 15 minutos, resetear contador
  if (ahora - datosIP.ultimoIntento > TIEMPO_BLOQUEO) {
    intentosPorIP.set(ip, { intentos: 1, ultimoIntento: ahora })
    return true
  }

  // Si excede el límite de intentos
  if (datosIP.intentos >= LIMITE_INTENTOS) {
    return false
  }

  // Incrementar intentos
  datosIP.intentos++
  datosIP.ultimoIntento = ahora
  return true
}

export async function POST(request) {
  try {
    // Obtener IP del cliente
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Verificar límite de intentos por IP
    if (!verificarLimiteIntentos(ip)) {
      return NextResponse.json(
        { 
          error: 'Demasiados intentos de login desde esta IP. Intente en 15 minutos.' 
        },
        { status: 429 }
      )
    }

    // Verificar conexión a base de datos
    const conexionOk = await verificarConexion()
    if (!conexionOk) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      )
    }

    // Obtener datos del body
    const { nombreUsuario, password } = await request.json()

    // Validar datos de entrada
    const validacion = validarDatosLogin(nombreUsuario, password)
    if (!validacion.esValido) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          errores: validacion.errores 
        },
        { status: 400 }
      )
    }

    // Intentar autenticación
    const resultado = await autenticarUsuario(nombreUsuario, password)

    // Login exitoso, resetear intentos de esta IP
    if (intentosPorIP.has(ip)) {
      intentosPorIP.delete(ip)
    }

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json({
      mensaje: 'Login exitoso',
      usuario: resultado.usuario
    })

    // Configurar cookie segura
    response.cookies.set('token-optica', resultado.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en login:', error)

    // Categorizar errores
    if (error.message.includes('Usuario') || 
        error.message.includes('Contraseña') || 
        error.message.includes('bloqueado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}