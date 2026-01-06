CREATE DATABASE IF NOT EXISTS obrapp;
USE obrapp;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS obras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  clave VARCHAR(10),
  direccion VARCHAR(255),
  ubicacion VARCHAR(255),
  cliente VARCHAR(255),
  responsable VARCHAR(255),
  fecha_inicio DATE,
  honorarios_porcentaje DECIMAL(5, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cuentas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  obra_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (obra_id) REFERENCES obras(id)
);

CREATE TABLE IF NOT EXISTS gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  obra_id INT NOT NULL,
  cuenta_id INT,
  tipo VARCHAR(10),
  partida VARCHAR(100),
  concepto VARCHAR(255),
  proveedor VARCHAR(255),
  referencia_comprobante VARCHAR(50),
  comprobante_path VARCHAR(255),
  monto DECIMAL(12, 2) NOT NULL,
  iva TINYINT(1) DEFAULT 0,
  estatus_pago VARCHAR(10) DEFAULT 'PP',
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (obra_id) REFERENCES obras(id),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
);

CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  obra_id INT NOT NULL,
  gasto_id INT NOT NULL,
  cuenta_id INT NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (obra_id) REFERENCES obras(id),
  FOREIGN KEY (gasto_id) REFERENCES gastos(id),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
);

CREATE TABLE IF NOT EXISTS estimaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  obra_id INT NOT NULL,
  numero_estimacion INT NOT NULL,
  semana VARCHAR(10) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  fecha_generacion DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Cerrada',
  pago_semana_anterior DECIMAL(12, 2) NOT NULL,
  saldo_semana_anterior DECIMAL(12, 2) NOT NULL,
  saldo_inicial DECIMAL(12, 2) NOT NULL,
  gastos_semana_importe DECIMAL(12, 2) NOT NULL,
  honorarios_porcentaje DECIMAL(5, 2) NOT NULL,
  honorarios_importe DECIMAL(12, 2) NOT NULL,
  total_gastos_semana DECIMAL(12, 2) NOT NULL,
  pagos_semana DECIMAL(12, 2) NOT NULL,
  saldo_final DECIMAL(12, 2) NOT NULL,
  total_a_pagar DECIMAL(12, 2) NOT NULL,
  generado_por VARCHAR(255) DEFAULT 'Sistema',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY estimacion_periodo_unico (obra_id, periodo_inicio, periodo_fin),
  FOREIGN KEY (obra_id) REFERENCES obras(id)
);

CREATE TABLE IF NOT EXISTS estimacion_gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estimacion_id INT NOT NULL,
  gasto_id INT NOT NULL,
  fecha DATE NOT NULL,
  concepto VARCHAR(255),
  proveedor VARCHAR(255),
  referencia_comprobante VARCHAR(50),
  subtotal DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  iva TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimacion_id) REFERENCES estimaciones(id),
  FOREIGN KEY (gasto_id) REFERENCES gastos(id)
);
