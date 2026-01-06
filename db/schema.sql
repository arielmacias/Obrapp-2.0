CREATE DATABASE IF NOT EXISTS obrapp;
USE obrapp;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS obras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre_proyecto VARCHAR(255) NOT NULL,
  clave CHAR(3) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  clientes VARCHAR(255) NOT NULL,
  responsable_obra VARCHAR(255) NOT NULL,
  fecha_inicio DATE NOT NULL,
  porcentaje_honorarios DECIMAL(5,2) NOT NULL,
  estado ENUM('activa', 'archivada') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_obras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT IGNORE INTO usuarios (email, password_hash, nombre)
VALUES ('demo@obrapp.local', SHA2('demo1234', 256), 'Demo Admin');
