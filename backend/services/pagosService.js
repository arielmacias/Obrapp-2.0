const pool = require('../db/pool');
const { getWeekRange, normalizeDateInput } = require('../utils/date');

const crearPago = async ({ obraId, gastoId, cuentaId, monto, fecha }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[gasto]] = await connection.query(
      'SELECT id, obra_id, monto FROM gastos WHERE id = ?',
      [gastoId]
    );

    if (!gasto) {
      const error = new Error('Gasto no encontrado');
      error.status = 404;
      throw error;
    }

    if (Number(gasto.obra_id) !== Number(obraId)) {
      const error = new Error('El gasto no pertenece a la obra indicada');
      error.status = 400;
      throw error;
    }

    const [result] = await connection.query(
      'INSERT INTO pagos (obra_id, gasto_id, cuenta_id, monto, fecha) VALUES (?, ?, ?, ?, ?)',
      [obraId, gastoId, cuentaId, monto, fecha]
    );

    await connection.query(
      'UPDATE gastos SET estatus_pago = ?, cuenta_id = ? WHERE id = ?',
      ['P', cuentaId, gastoId]
    );

    await connection.commit();

    const [[pago]] = await connection.query(
      `SELECT p.*, c.nombre AS cuenta_nombre
       FROM pagos p
       LEFT JOIN cuentas c ON c.id = p.cuenta_id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return pago;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listPagosByObra = async ({ obraId, fechaReferencia }) => {
  const fechaBase = normalizeDateInput(fechaReferencia);
  const { startSql, endSql } = getWeekRange(fechaBase);

  const [rows] = await pool.query(
    `SELECT p.*, c.nombre AS cuenta_nombre
     FROM pagos p
     LEFT JOIN cuentas c ON c.id = p.cuenta_id
     WHERE p.obra_id = ? AND p.fecha BETWEEN ? AND ?
     ORDER BY p.fecha DESC, p.id DESC`,
    [obraId, startSql, endSql]
  );

  return { pagos: rows, periodo: { inicio: startSql, fin: endSql } };
};

module.exports = { crearPago, listPagosByObra };
