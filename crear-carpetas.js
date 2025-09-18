// Script para crear las carpetas necesarias del proyecto
const fs = require('fs');
const path = require('path');

// Carpetas que necesitamos crear
const carpetas = [
  'public/uploads',
  'public/uploads/graduaciones',
  'public/uploads/recetas',
  'public/uploads/general'
];

console.log('🚀 Creando estructura de carpetas...\n');

carpetas.forEach(carpeta => {
  const rutaCompleta = path.join(process.cwd(), carpeta);
  
  try {
    if (!fs.existsSync(rutaCompleta)) {
      fs.mkdirSync(rutaCompleta, { recursive: true });
      console.log(`✅ Creada: ${carpeta}`);
    } else {
      console.log(`ℹ️  Ya existe: ${carpeta}`);
    }
  } catch (error) {
    console.error(`❌ Error creando ${carpeta}:`, error.message);
  }
});

// Crear archivos .gitkeep para mantener las carpetas en git
const archivosGitkeep = [
  'public/uploads/graduaciones/.gitkeep',
  'public/uploads/recetas/.gitkeep',
  'public/uploads/general/.gitkeep'
];

console.log('\n📁 Creando archivos .gitkeep...\n');

archivosGitkeep.forEach(archivo => {
  const rutaCompleta = path.join(process.cwd(), archivo);
  
  try {
    if (!fs.existsSync(rutaCompleta)) {
      fs.writeFileSync(rutaCompleta, '# Mantener esta carpeta en git\n');
      console.log(`✅ Creado: ${archivo}`);
    } else {
      console.log(`ℹ️  Ya existe: ${archivo}`);
    }
  } catch (error) {
    console.error(`❌ Error creando ${archivo}:`, error.message);
  }
});

console.log('\n🎉 ¡Estructura de carpetas creada exitosamente!\n');
console.log('📋 Próximos pasos:');
console.log('   1. Ejecuta: npm run dev');
console.log('   2. Ve a: http://localhost:3000/clientes');
console.log('   3. Crea un cliente y agrega graduaciones');
console.log('   4. ¡Prueba subir imágenes de graduaciones!\n');