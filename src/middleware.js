import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const rutasPublicas = [
    "/login",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/test-conexion",
    "/api/generar-hash",
  ];

  // Si es una ruta pública, permitir acceso
  if (rutasPublicas.includes(pathname)) {
    return NextResponse.next();
  }

  // Si es ruta API, verificar que tenga token (header o cookie)
  if (pathname.startsWith("/api/")) {
    let token = null;

    // Intentar obtener token del header
    const authorization = request.headers.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.replace("Bearer ", "");
    }

    // Si no hay header, intentar cookie
    if (!token) {
      token = request.cookies.get("token-optica")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    // Solo verificar que el token existe y tiene longitud mínima
    if (token.length < 50) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Para rutas de páginas, solo verificar que existe la cookie
  const tokenCookie = request.cookies.get("token-optica")?.value;

  if (!tokenCookie || tokenCookie.length < 50) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.ico|.*\\.svg|uploads).*)",
  ],
};
