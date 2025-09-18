import { NextResponse } from 'next/server'
import { hashearPassword } from '@/lib/autenticacion'

export async function GET() {
  try {
    const password = 'admin123'
    const hash = await hashearPassword(password)
    
    return NextResponse.json({
      password: password,
      hash: hash,
      sql: `UPDATE usuarios SET password_hash = '${hash}' WHERE nombre_usuario = 'admin';`
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}