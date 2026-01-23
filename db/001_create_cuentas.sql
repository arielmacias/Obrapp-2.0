CREATE TABLE IF NOT EXISTS cuentas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  tipo ENUM('efectivo','bancaria_personal','bancaria_empresarial') NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cuentas_usuario FOREIGN KEY (created_by) REFERENCES usuarios(id),
  INDEX idx_cuentas_created_by (created_by),
  INDEX idx_cuentas_activa (activa),
  INDEX idx_cuentas_tipo (tipo)
);
