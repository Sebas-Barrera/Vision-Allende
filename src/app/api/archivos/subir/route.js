import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Configuración de archivos
const TAMAÑO_MAX_ARCHIVO = 5 * 1024 * 1024; // 5MB
const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("archivo");
    const tipo = formData.get("tipo") || "general"; // 'graduacion', 'receta', 'general'

    if (!archivo) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo JPG, JPEG y PNG." },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (archivo.size > TAMAÑO_MAX_ARCHIVO) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const extension = archivo.name.split(".").pop();
    const nombreArchivo = `${uuidv4()}.${extension}`;

    // Determinar carpeta según el tipo
    let carpeta = "general";
    if (tipo === "graduacion") {
      carpeta = "graduaciones";
    } else if (tipo === "receta") {
      carpeta = "recetas";
    }

    // Crear ruta completa
    const rutaCarpeta = join(process.cwd(), "public", "uploads", carpeta);
    const rutaArchivo = join(rutaCarpeta, nombreArchivo);

    try {
      // Crear carpeta si no existe
      await mkdir(rutaCarpeta, { recursive: true });

      // Convertir archivo a buffer y guardar
      const bytes = await archivo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(rutaArchivo, buffer);

      // Generar URL relativa para la base de datos
      const rutaRelativa = `${carpeta}/${nombreArchivo}`;
      const urlCompleta = `/uploads/${rutaRelativa}`;

      return NextResponse.json({
        mensaje: "Archivo subido exitosamente",
        ruta: rutaRelativa,
        url: urlCompleta,
        nombre_original: archivo.name,
        tamaño: archivo.size,
        tipo: archivo.type,
      });
    } catch (errorArchivo) {
      console.error("Error guardando archivo:", errorArchivo);
      return NextResponse.json(
        { error: "Error guardando el archivo en el servidor" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error procesando archivo:", error);
    return NextResponse.json(
      { error: "Error procesando el archivo" },
      { status: 500 }
    );
  }
}

// GET - Obtener información de archivo (opcional)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ruta = searchParams.get("ruta");

    if (!ruta) {
      return NextResponse.json(
        { error: "Ruta de archivo requerida" },
        { status: 400 }
      );
    }

    // Verificar que el archivo existe
    const rutaCompleta = join(process.cwd(), "public", "uploads", ruta);

    try {
      const fs = require("fs");
      const stats = fs.statSync(rutaCompleta);

      return NextResponse.json({
        existe: true,
        tamaño: stats.size,
        fecha_modificacion: stats.mtime,
        url: `/uploads/${ruta}`,
      });
    } catch (errorStat) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error obteniendo información de archivo:", error);
    return NextResponse.json(
      { error: "Error obteniendo información del archivo" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar archivo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ruta = searchParams.get("ruta");

    if (!ruta) {
      return NextResponse.json(
        { error: "Ruta de archivo requerida" },
        { status: 400 }
      );
    }

    const rutaCompleta = join(process.cwd(), "public", "uploads", ruta);

    try {
      const fs = require("fs");
      fs.unlinkSync(rutaCompleta);

      return NextResponse.json({
        mensaje: "Archivo eliminado exitosamente",
      });
    } catch (errorEliminar) {
      return NextResponse.json(
        { error: "Error eliminando archivo o archivo no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error eliminando archivo:", error);
    return NextResponse.json(
      { error: "Error eliminando archivo" },
      { status: 500 }
    );
  }
}
