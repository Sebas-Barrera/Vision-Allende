'use client'

import FormularioLogin from '@/components/auth/FormularioLogin'

export default function PaginaLogin() {
  // Removemos la verificación automática que causa los errores 401
  return <FormularioLogin />
}