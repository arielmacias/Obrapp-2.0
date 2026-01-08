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
