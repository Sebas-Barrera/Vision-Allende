import { NextResponse } from 'next/server'
import { obtenerUsuarioDeToken } from '@/lib/autenticacion'

export async function GET(request) {
  try {
    // Intentar obtener token de diferentes fuentes
    let token = null
    
    // 1. Primero intentar desde cookie
    const tokenCookie = request.cookies.get('token-optica')?.value
    if (tokenCookie) {
      token = tokenCookie
    }
    
    // 2. Si no hay cookie, intentar desde header (para compatibilidad con API)
    if (!token) {
      const authorization = request.headers.get('authorization')
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.replace('Bearer ', '')
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    // Verificar y obtener datos del usuario
    const usuario = await obtenerUsuarioDeToken(token)

    return NextResponse.json({
      valido: true,
      usuario
    })

  } catch (error) {
    console.error('Error verificando token:', error)

    // Diferentes tipos de errores de token
    if (error.message.includes('jwt expired')) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }

    if (error.message.includes('jwt malformed') || error.message.includes('invalid signature')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    if (error.message.includes('Usuario no encontrado')) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Error verificando token' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  // Mismo comportamiento que GET para compatibilidad
  return GET(request)
}