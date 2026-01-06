const pool = require('../db/pool');
const { getWeekRange, normalizeDateInput } = require('../utils/date');

const createGasto = async ({ obraId, payload, comprobantePath }) => {
  const {
    cuenta_id,
    tipo,
    partida,
    concepto,
    proveedor,
    referencia_comprobante,
    monto,
    iva,
    estatus_pago,
    fecha
  } = payload;

  const ivaValue = iva === true || iva === 'true' || iva === '1' || iva === 1;

  const [result] = await pool.query(
    `INSERT INTO gastos
      (obra_id, cuenta_id, tipo, partida, concepto, proveedor, referencia_comprobante,
       monto, iva, estatus_pago, fecha, comprobante_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      obraId,
      cuenta_id || null,
      tipo,
      partida,
      concepto,
      proveedor || null,
      referencia_comprobante || null,
      monto,
      ivaValue ? 1 : 0,
      estatus_pago || 'PP',
      fecha,
      comprobantePath || null
    ]
  );

  return getGastoById(result.insertId);
};

const listGastosByObra = async ({ obraId, fechaReferencia, incluirNoPagados = true }) => {
  const fechaBase = normalizeDateInput(fechaReferencia);
  const { startSql, endSql } = getWeekRange(fechaBase);

  let where = 'obra_id = ? AND (fecha BETWEEN ? AND ?)';
  const params = [obraId, startSql, endSql];

  if (incluirNoPagados) {
    where = `obra_id = ? AND (fecha BETWEEN ? AND ? OR estatus_pago = 'PP')`;
  }

  const [rows] = await pool.query(
    `SELECT g.*, c.nombre AS cuenta_nombre
     FROM gastos g
     LEFT JOIN cuentas c ON c.id = g.cuenta_id
     WHERE ${where}
     ORDER BY g.fecha DESC, g.id DESC`,
    params
  );

  return { gastos: rows, periodo: { inicio: startSql, fin: endSql } };
};

const getGastoById = async (gastoId) => {
  const [[gasto]] = await pool.query(
    `SELECT g.*, c.nombre AS cuenta_nombre
     FROM gastos g
     LEFT JOIN cuentas c ON c.id = g.cuenta_id
     WHERE g.id = ?`,
    [gastoId]
  );

  if (!gasto) {
    const error = new Error('Gasto no encontrado');
    error.status = 404;
    throw error;
  }

  return gasto;
};

const updateGasto = async (gastoId, payload) => {
  const ivaValue =
    payload.iva === undefined
      ? undefined
      : payload.iva === true || payload.iva === 'true' || payload.iva === '1' || payload.iva === 1
      ? 1
      : 0;

  const fields = {
    tipo: payload.tipo,
    partida: payload.partida,
    concepto: payload.concepto,
    proveedor: payload.proveedor,
    referencia_comprobante: payload.referencia_comprobante,
    monto: payload.monto,
    iva: ivaValue,
    estatus_pago: payload.estatus_pago,
    cuenta_id: payload.cuenta_id,
    fecha: payload.fecha,
    comprobante_path: payload.comprobante_path
  };

  const updates = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (updates.length === 0) {
    return getGastoById(gastoId);
  }

  const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
  const values = updates.map(([, value]) => value);

  await pool.query(`UPDATE gastos SET ${setClause} WHERE id = ?`, [...values, gastoId]);

  return getGastoById(gastoId);
};

module.exports = {
  createGasto,
  listGastosByObra,
  getGastoById,
  updateGasto
};
