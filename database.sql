-- QUERY TRUNCATED
-- =============================================
-- DUMP BASE DE DATOS - SISTEMA ÓPTICA
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: usuarios (para login del sistema)
-- =============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: periodos_contables
-- =============================================
CREATE TABLE periodos_contables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL, -- "Septiembre / Octubre"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: clientes
-- =============================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente VARCHAR(20) UNIQUE,
    nombre_completo VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    edad INTEGER,
    ocupacion VARCHAR(100),
    direccion TEXT,
    email VARCHAR(100),
    telefono VARCHAR(20),
    celular VARCHAR(20),
    motivo_consulta TEXT,
    peso DECIMAL(5,2),
    talla DECIMAL(4,2),
    imc DECIMAL(4,2),
    fr INTEGER, -- Frecuencia respiratoria
    temperatura DECIMAL(4,1),
    saturacion_oxigeno INTEGER,
    ritmo_cardiaco INTEGER,
    presion_arterial VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: antecedentes_medicos
-- =============================================
CREATE TABLE antecedentes_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    presion_alta BOOLEAN DEFAULT false,
    diabetes BOOLEAN DEFAULT false,
    alergias TEXT,
    notas_extras TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: graduaciones
-- =============================================
CREATE TABLE graduaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('lejos', 'cerca')),
    
    -- Ojo Derecho (OD)
    od_esfera DECIMAL(4,2),
    od_cilindro DECIMAL(4,2),
    od_eje INTEGER,
    od_adicion DECIMAL(4,2),
    
    -- Ojo Izquierdo (OI)  
    oi_esfera DECIMAL(4,2),
    oi_cilindro DECIMAL(4,2),
    oi_eje INTEGER,
    oi_adicion DECIMAL(4,2),
    
    -- Imagen de resultados (opcional)
    imagen_resultado TEXT, -- URL o path de la imagen
    
    fecha_examen DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: ventas
-- =============================================
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_venta VARCHAR(20) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    periodo_id UUID REFERENCES periodos_contables(id) ON DELETE SET NULL,
    
    -- Información del producto
    marca_armazon VARCHAR(100),
    laboratorio VARCHAR(100) CHECK (laboratorio IN ('Laboratorio 1', 'Laboratorio 2', 'Laboratorio 3')),
    precio_armazon DECIMAL(10,2),
    precio_micas DECIMAL(10,2),
    costo_total DECIMAL(10,2) NOT NULL,
    
    -- Control de pagos
    total_depositado DECIMAL(10,2) DEFAULT 0,
    saldo_restante DECIMAL(10,2) NOT NULL,
    
    -- Archivos
    imagen_receta TEXT, -- URL o path de imagen de receta
    
    -- Estado y seguimiento
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_laboratorio', 'listo', 'entregado', 'cancelado')),
    fecha_llegada_laboratorio DATE,
    fecha_entrega_cliente DATE,
    
    -- Notas
    notas TEXT,
    
    -- Metadatos
    fecha_venta DATE DEFAULT CURRENT_DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: depositos (historial de abonos)
-- =============================================
CREATE TABLE depositos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
    fecha_deposito DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES para optimización
-- =============================================
CREATE INDEX idx_clientes_nombre ON clientes(nombre_completo);
CREATE INDEX idx_clientes_expediente ON clientes(expediente);
CREATE INDEX idx_ventas_numero ON ventas(numero_venta);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_periodo ON ventas(periodo_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_depositos_venta ON depositos(venta_id);
CREATE INDEX idx_depositos_fecha ON depositos(fecha_deposito);
CREATE INDEX idx_graduaciones_cliente ON graduaciones(cliente_id);

-- =============================================
-- TRIGGERS para actualizar fecha_actualizacion
-- =============================================

-- Trigger para clientes
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_actualizacion
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_ventas_actualizacion
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_antecedentes_actualizacion
    BEFORE UPDATE ON antecedentes_medicos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_graduaciones_actualizacion
    BEFORE UPDATE ON graduaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =============================================
-- FUNCIÓN para actualizar saldo restante en ventas
-- =============================================
CREATE OR REPLACE FUNCTION actualizar_saldo_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Actualizar total depositado y saldo restante
        UPDATE ventas 
        SET 
            total_depositado = (
                SELECT COALESCE(SUM(monto), 0) 
                FROM depositos 
                WHERE venta_id = NEW.venta_id
            )
        WHERE id = NEW.venta_id;
        
        UPDATE ventas 
        SET saldo_restante = costo_total - total_depositado
        WHERE id = NEW.venta_id;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Actualizar total depositado y saldo restante
        UPDATE ventas 
        SET 
            total_depositado = (
                SELECT COALESCE(SUM(monto), 0) 
                FROM depositos 
                WHERE venta_id = OLD.venta_id
            )
        WHERE id = OLD.venta_id;
        
        UPDATE ventas 
        SET saldo_restante = costo_total - total_depositado
        WHERE id = OLD.venta_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_saldo
    AFTER INSERT OR DELETE ON depositos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo_venta();

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Usuario administrador inicial (password: admin123)
INSERT INTO usuarios (nombre_usuario, password_hash, nombre_completo) 
VALUES ('admin', '$2b$10$rOzKqNvGyCMgRgL9QQ.YmeFSBnvGNP/xHZkH.wLmYxVHzplVfD6hC', 'Administrador Sistema');

-- Período contable inicial
INSERT INTO periodos_contables (nombre, fecha_inicio, fecha_fin, activo) 
VALUES (
    CONCAT(
   