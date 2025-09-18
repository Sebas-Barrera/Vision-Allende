import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Crear respuesta de logout exitoso
    const response = NextResponse.json({
      mensaje: 'Sesión cerrada exitosamente'
    })

    // Eliminar la cookie de sesión
    response.cookies.set('token-optica', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en logout:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// También permitir GET para compatibilidad
export async function GET(request) {
  return POST(request)
}