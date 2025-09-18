import { NextResponse } from 'next/server'
import { ejecutarConsulta } from '@/lib/conexion-bd'

export async function GET() {
  try {
    // 1. Probar conexión básica
    const resultadoConexion = await ejecutarConsulta('SELECT NOW() as hora_servidor, version() as version_pg')
    
    // 2. Verificar que existen las tablas principales
    const resultadoTablas = await ejecutarConsulta(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'clientes', 'ventas', 'graduaciones', 'depositos', 'periodos_contables', 'antecedentes_medicos')
      ORDER BY table_name
    `)

    // 3. Contar registros en tabla usuarios
    const resultadoUsuarios = await ejecutarConsulta('SELECT COUNT(*) as total_usuarios FROM usuarios')

    // 4. Verificar que existe el usuario admin
    const resultadoAdmin = await ejecutarConsulta(
      'SELECT nombre_usuario, nombre_completo, activo FROM usuarios WHERE nombre_usuario = $1', 
      ['admin']
    )

    const response = {
      estado: 'conectado',
      timestamp: new Date().toISOString(),
      base_datos: {
        hora_servidor: resultadoConexion.rows[0]?.hora_servidor,
        version: resultadoConexion.rows[0]?.version_pg?.substring(0, 50) + '...',
      },
      tablas: {
        total_encontradas: resultadoTablas.rows.length,
        esperadas: 7,
        lista: resultadoTablas.rows.map(row => row.table_name),
        todas_existen: resultadoTablas.rows.length === 7
      },
      usuarios: {
        total: parseInt(resultadoUsuarios.rows[0]?.total_usuarios || 0),
        admin_existe: resultadoAdmin.rows.length > 0,
        admin_info: resultadoAdmin.rows[0] || null
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error probando conexión:', error)

    let detalleError = error.message
    let sugerencia = ''

    // Analizar tipo de error y dar sugerencias
    if (error.code === 'ENOTFOUND') {
      sugerencia = 'Verifica la URL de conexión en .env.local'
    } else if (error.code === '28P01') {
      sugerencia = 'Usuario o contraseña incorrectos en la conexión'
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      sugerencia = 'Las tablas no existen. Ejecuta el dump de la base de datos.'
    } else if (error.code === 'ECONNREFUSED') {
      sugerencia = 'No se puede conectar al servidor de base de datos'
    }

    return NextResponse.json({
      estado: 'error',
      timestamp: new Date().toISOString(),
      error: {
        mensaje: detalleError,
        codigo: error.code,
        sugerencia
      }
    }, { status: 500 })
  }
}