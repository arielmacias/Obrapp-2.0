CREATE TABLE IF NOT EXISTS equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','resid') NOT NULL,
  equipo_id INT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE IF NOT EXISTS obras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  created_by INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  clave CHAR(3) NOT NULL,
  cliente_nombre VARCHAR(120) NULL,
  status ENUM('ACTIVA','PAUSADA','CERRADA') NOT NULL DEFAULT 'ACTIVA',
  fecha_inicio DATE NULL,
  direccion_estado VARCHAR(60) NULL,
  direccion_ciudad VARCHAR(80) NULL,
  direccion_colonia VARCHAR(80) NULL,
  direccion_calle VARCHAR(120) NULL,
  direccion_numero VARCHAR(20) NULL,
  direccion_cp VARCHAR(10) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  portada_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_obras_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id),
  CONSTRAINT fk_obras_usuario FOREIGN KEY (created_by) REFERENCES usuarios(id),
  UNIQUE KEY uq_obras_equipo_clave (equipo_id, clave),
  INDEX idx_obras_equipo (equipo_id)
);

CREATE TABLE IF NOT EXISTS cuentas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  tipo ENUM('efectivo','bancaria_personal','bancaria_empresarial') NOT NULL,
  saldo DECIMAL(12,2) NOT NULL DEFAULT 0,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cuentas_usuario FOREIGN KEY (created_by) REFERENCES usuarios(id),
  INDEX idx_cuentas_created_by (created_by),
  INDEX idx_cuentas_activa (activa),
  INDEX idx_cuentas_tipo (tipo)
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gastos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  obra_id INT NOT NULL,
  cuenta_id INT NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('MO','MAT','CON','IND') NOT NULL,
  partida VARCHAR(120) NOT NULL,
  concepto VARCHAR(140) NOT NULL,
  proveedor_id INT NULL,
  referencia_comprobante VARCHAR(10) NULL,
  comprobante_nombre VARCHAR(255) NULL,
  comprobante_filename VARCHAR(255) NULL,
  comprobante_path VARCHAR(255) NULL,
  comprobante_mime VARCHAR(50) NULL,
  comprobante_size INT NULL,
  comprobante_pendiente TINYINT(1) NOT NULL DEFAULT 1,
  importe DECIMAL(12,2) NOT NULL,
  iva_aplica TINYINT(1) NOT NULL DEFAULT 0,
  pago_status ENUM('POR_PAGAR','PAGADO') NOT NULL,
  created_by INT NOT NULL,
  updated_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_gastos_obra FOREIGN KEY (obra_id) REFERENCES obras(id),
  CONSTRAINT fk_gastos_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas(id),
  CONSTRAINT fk_gastos_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  CONSTRAINT fk_gastos_usuario FOREIGN KEY (created_by) REFERENCES usuarios(id),
  INDEX idx_gastos_obra (obra_id),
  INDEX idx_gastos_cuenta (cuenta_id),
  INDEX idx_gastos_fecha (fecha),
  INDEX idx_gastos_pago_status (pago_status),
  INDEX idx_gastos_deleted (deleted_at)
);
