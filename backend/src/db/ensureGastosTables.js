import pool from "../db.js";

let ensureGastosTablesPromise;

const ensureGastosTables = async () => {
  if (!ensureGastosTablesPromise) {
    ensureGastosTablesPromise = pool.query(
      `CREATE TABLE IF NOT EXISTS proveedores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(120) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    await ensureGastosTablesPromise;

    ensureGastosTablesPromise = pool.query(
      `CREATE TABLE IF NOT EXISTS gastos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        obra_id INT NOT NULL,
        cuenta_id INT NOT NULL,
        fecha DATE NOT NULL,
        tipo ENUM('MO','MAT','CON','IND') NOT NULL,
        partida VARCHAR(120) NOT NULL,
        concepto VARCHAR(140) NOT NULL,
        proveedor_id INT NULL,
        referencia_comprobante VARCHAR(10) NULL,
        comprobante_path VARCHAR(255) NULL,
        comprobante_mime VARCHAR(50) NULL,
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
      );`
    );
  }

  await ensureGastosTablesPromise;
};

export default ensureGastosTables;
