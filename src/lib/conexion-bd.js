import { Pool } from "pg";

// Configuración usando variables de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function ejecutarConsulta(texto, parametros = []) {
  const cliente = await pool.connect();
  try {
    const resultado = await cliente.query(texto, parametros);
    return resultado;
  } catch (error) {
    console.error("Error en consulta SQL:", error);
    throw error;
  } finally {
    cliente.release();
  }
}

// === CONSULTAS PARA USUARIOS ===
export const consultasUsuarios = {
  // Obtener usuario por nombre de usuario
  obtenerPorNombre: async (nombreUsuario) => {
    const consulta = `
      SELECT id, nombre_usuario, password_hash, nombre_completo, 
             activo, intentos_fallidos, bloqueado_hasta
      FROM usuarios 
      WHERE nombre_usuario = $1
    `;
    const resultado = await ejecutarConsulta(consulta, [nombreUsuario]);
    return resultado.rows[0];
  },

  // Actualizar intentos fallidos
  actualizarIntentos: async (id, intentos, bloqueoHasta = null) => {
    const consulta = `
      UPDATE usuarios 
      SET intentos_fallidos = $2, bloqueado_hasta = $3, fecha_actualizacion = NOW()
      WHERE id = $1
    `;
    await ejecutarConsulta(consulta, [id, intentos, bloqueoHasta]);
  },

  // Resetear intentos fallidos
  resetearIntentos: async (id) => {
    const consulta = `
      UPDATE usuarios 
      SET intentos_fallidos = 0, bloqueado_hasta = NULL, fecha_actualizacion = NOW()
      WHERE id = $1
    `;
    await ejecutarConsulta(consulta, [id]);
  },
};

export async function verificarConexion() {
  try {
    await ejecutarConsulta("SELECT NOW()");
    console.log("Conexión a base de datos exitosa");
    return true;
  } catch (error) {
    console.error("Error conectando a base de datos:", error.message);
    return false;
  }
}

// === FUNCIÓN PARA TRANSACCIONES ===
export async function ejecutarTransaccion(callback) {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await callback(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    console.error("Error en transacción:", error);
    throw error;
  } finally {
    cliente.release();
  }
}

export default pool;
