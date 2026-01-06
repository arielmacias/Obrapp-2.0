const pool = require('../db/pool');

const listCuentasByObra = async (obraId) => {
  const [rows] = await pool.query(
    `SELECT id, obra_id, nombre, created_at
     FROM cuentas
     WHERE obra_id = ?
     ORDER BY created_at DESC`,
    [obraId]
  );
  return rows;
};

const createCuenta = async (obraId, nombre) => {
  const [result] = await pool.query(
    'INSERT INTO cuentas (obra_id, nombre) VALUES (?, ?)',
    [obraId, nombre]
  );
  const [[cuenta]] = await pool.query(
    `SELECT id, obra_id, nombre, created_at
     FROM cuentas
     WHERE id = ?`,
    [result.insertId]
  );
  return cuenta;
};

module.exports = { listCuentasByObra, createCuenta };
