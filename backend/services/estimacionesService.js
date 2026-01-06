const PDFDocument = require('pdfkit');
const pool = require('../db/pool');

const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const formatDateToSql = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateInput = (value) => {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const getWeekRange = (date) => {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(base);
  start.setDate(base.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start,
    end,
    startSql: formatDateToSql(start),
    endSql: formatDateToSql(end)
  };
};

const getIsoWeekLabel = (date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((target - firstThursday) / (7 * 24 * 3600 * 1000));
  const year = target.getUTCFullYear();
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const toDateLabel = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
};

const toCurrency = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));

const buildEstimationSnapshot = async ({ obraId, fecha }) => {
  const targetDate = normalizeDateInput(fecha);
  const { start, end, startSql, endSql } = getWeekRange(targetDate);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - 7);
  const prevStartSql = formatDateToSql(prevStart);
  const prevEndSql = formatDateToSql(prevEnd);

  const [[obra]] = await pool.query(
    'SELECT id, nombre, direccion, cliente, honorarios_porcentaje FROM obras WHERE id = ?',
    [obraId]
  );

  if (!obra) {
    const error = new Error('Obra no encontrada');
    error.status = 404;
    throw error;
  }

  const [gastosSemana] = await pool.query(
    `SELECT id, fecha, concepto, proveedor, referencia_comprobante, monto, iva, cuenta_id, estatus_pago
     FROM gastos
     WHERE obra_id = ? AND fecha BETWEEN ? AND ?
     ORDER BY fecha ASC, id ASC`,
    [obraId, startSql, endSql]
  );

  const [[gastosAcumuladosRow]] = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE obra_id = ? AND fecha <= ?',
    [obraId, prevEndSql]
  );

  const [[pagosAcumuladosRow]] = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE obra_id = ? AND fecha <= ?',
    [obraId, prevEndSql]
  );

  const [[pagosSemanaAnteriorRow]] = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE obra_id = ? AND fecha BETWEEN ? AND ?',
    [obraId, prevStartSql, prevEndSql]
  );

  const [[pagosSemanaRow]] = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM pagos WHERE obra_id = ? AND fecha BETWEEN ? AND ?',
    [obraId, startSql, endSql]
  );

  const honorariosPorcentaje = Number(obra.honorarios_porcentaje || 0);
  const gastosAcumulados = roundCurrency(gastosAcumuladosRow.total);
  const honorariosAcumulados = roundCurrency((gastosAcumulados * honorariosPorcentaje) / 100);
  const pagosAcumulados = roundCurrency(pagosAcumuladosRow.total);

  const saldoSemanaAnterior = roundCurrency(gastosAcumulados + honorariosAcumulados - pagosAcumulados);
  const pagoSemanaAnterior = roundCurrency(pagosSemanaAnteriorRow.total);

  const gastosSemanaImporte = roundCurrency(
    gastosSemana.reduce((acc, gasto) => acc + Number(gasto.monto || 0), 0)
  );
  const honorariosImporte = roundCurrency((gastosSemanaImporte * honorariosPorcentaje) / 100);
  const totalGastosSemana = roundCurrency(gastosSemanaImporte + honorariosImporte);
  const pagosSemana = roundCurrency(pagosSemanaRow.total);

  const saldoFinal = roundCurrency(saldoSemanaAnterior - totalGastosSemana + pagosSemana);

  const resumenPrevio = gastosSemana.reduce(
    (acc, gasto) => {
      const monto = Number(gasto.monto || 0);
      if (gasto.estatus_pago === 'P') {
        acc.pagados += monto;
      } else if (gasto.estatus_pago === 'PP') {
        acc.porPagar += monto;
      }
      acc.cuentasAfectadas.add(gasto.cuenta_id);
      return acc;
    },
    { pagados: 0, porPagar: 0, cuentasAfectadas: new Set() }
  );

  const gastosDetallados = gastosSemana.map((gasto) => {
    const subtotal = gasto.iva ? roundCurrency(Number(gasto.monto || 0) / 1.16) : roundCurrency(gasto.monto);
    return {
      gastoId: gasto.id,
      fecha: gasto.fecha,
      concepto: gasto.concepto,
      proveedor: gasto.proveedor,
      referencia: gasto.referencia_comprobante,
      subtotal,
      total: roundCurrency(gasto.monto),
      iva: Boolean(gasto.iva)
    };
  });

  return {
    obra,
    periodo: {
      inicio: startSql,
      fin: endSql,
      semana: getIsoWeekLabel(start)
    },
    resumenPrevio: {
      gastosTotales: roundCurrency(gastosSemanaImporte),
      pagados: roundCurrency(resumenPrevio.pagados),
      porPagar: roundCurrency(resumenPrevio.porPagar),
      cuentasAfectadas: resumenPrevio.cuentasAfectadas.size
    },
    calculos: {
      pagoSemanaAnterior,
      saldoSemanaAnterior,
      saldoInicial: saldoSemanaAnterior,
      gastosSemanaImporte,
      honorariosPorcentaje,
      honorariosImporte,
      totalGastosSemana,
      pagosSemana,
      saldoFinal,
      totalAPagar: saldoFinal
    },
    gastosDetallados
  };
};

const createEstimation = async ({ obraId, fecha, generadoPor }) => {
  const snapshot = await buildEstimationSnapshot({ obraId, fecha });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM estimaciones WHERE obra_id = ? AND periodo_inicio = ? AND periodo_fin = ? LIMIT 1',
      [obraId, snapshot.periodo.inicio, snapshot.periodo.fin]
    );

    if (existing.length > 0) {
      const error = new Error('Ya existe una estimación para este periodo.');
      error.status = 409;
      throw error;
    }

    const [[numeroRow]] = await connection.query(
      'SELECT COALESCE(MAX(numero_estimacion), 0) + 1 AS siguiente FROM estimaciones WHERE obra_id = ?',
      [obraId]
    );

    const fechaGeneracion = formatDateToSql(new Date());

    const [result] = await connection.query(
      `INSERT INTO estimaciones (
        obra_id, numero_estimacion, semana, periodo_inicio, periodo_fin, fecha_generacion,
        status, pago_semana_anterior, saldo_semana_anterior, saldo_inicial,
        gastos_semana_importe, honorarios_porcentaje, honorarios_importe, total_gastos_semana,
        pagos_semana, saldo_final, total_a_pagar, generado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        obraId,
        numeroRow.siguiente,
        snapshot.periodo.semana,
        snapshot.periodo.inicio,
        snapshot.periodo.fin,
        fechaGeneracion,
        'Cerrada',
        snapshot.calculos.pagoSemanaAnterior,
        snapshot.calculos.saldoSemanaAnterior,
        snapshot.calculos.saldoInicial,
        snapshot.calculos.gastosSemanaImporte,
        snapshot.calculos.honorariosPorcentaje,
        snapshot.calculos.honorariosImporte,
        snapshot.calculos.totalGastosSemana,
        snapshot.calculos.pagosSemana,
        snapshot.calculos.saldoFinal,
        snapshot.calculos.totalAPagar,
        generadoPor || 'Sistema'
      ]
    );

    if (snapshot.gastosDetallados.length > 0) {
      const values = snapshot.gastosDetallados.map((gasto) => [
        result.insertId,
        gasto.gastoId,
        gasto.fecha,
        gasto.concepto,
        gasto.proveedor,
        gasto.referencia,
        gasto.subtotal,
        gasto.total,
        gasto.iva ? 1 : 0
      ]);

      await connection.query(
        `INSERT INTO estimacion_gastos (
          estimacion_id, gasto_id, fecha, concepto, proveedor, referencia_comprobante,
          subtotal, total, iva
        ) VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listEstimacionesByObra = async (obraId) => {
  const [rows] = await pool.query(
    `SELECT id, numero_estimacion, semana, periodo_inicio, periodo_fin, fecha_generacion, status,
            total_a_pagar
     FROM estimaciones
     WHERE obra_id = ?
     ORDER BY periodo_inicio DESC`,
    [obraId]
  );
  return rows;
};

const getEstimacionById = async (estimacionId) => {
  const [[estimacion]] = await pool.query(
    `SELECT e.*, o.nombre AS obra_nombre, o.direccion, o.cliente
     FROM estimaciones e
     JOIN obras o ON o.id = e.obra_id
     WHERE e.id = ?`,
    [estimacionId]
  );

  if (!estimacion) {
    const error = new Error('Estimación no encontrada');
    error.status = 404;
    throw error;
  }

  const [gastos] = await pool.query(
    `SELECT fecha, concepto, proveedor, referencia_comprobante, subtotal, total, iva
     FROM estimacion_gastos
     WHERE estimacion_id = ?
     ORDER BY fecha ASC, id ASC`,
    [estimacionId]
  );

  return { estimacion, gastos };
};

const buildEstimacionPdf = async (estimacionId) => {
  const { estimacion, gastos } = await getEstimacionById(estimacionId);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(18).text('Estimación semanal', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(12).text('Datos de obra', { underline: true });
  doc.fontSize(10);
  doc.text(`Nombre: ${estimacion.obra_nombre || ''}`);
  doc.text(`Dirección: ${estimacion.direccion || ''}`);
  doc.text(`Cliente: ${estimacion.cliente || ''}`);
  doc.moveDown(0.8);

  doc.fontSize(12).text('Datos de estimación', { underline: true });
  doc.fontSize(10);
  doc.text(`Fecha: ${toDateLabel(estimacion.fecha_generacion)}`);
  doc.text(`No. de estimación: ${estimacion.numero_estimacion}`);
  doc.text(`Semana del año: ${estimacion.semana}`);
  doc.moveDown(0.8);

  doc.fontSize(12).text('Estado de cuenta semana anterior', { underline: true });
  doc.fontSize(10);
  doc.text(`Pago semana anterior: ${toCurrency(estimacion.pago_semana_anterior)}`);
  doc.text(`Saldo semana anterior: ${toCurrency(estimacion.saldo_semana_anterior)}`);
  doc.text(`Saldo al iniciar la semana: ${toCurrency(estimacion.saldo_inicial)}`);
  doc.moveDown(0.8);

  doc.fontSize(12).text('Gastos de la semana en curso', { underline: true });
  doc.moveDown(0.3);

  const tableTop = doc.y;
  const columns = [40, 120, 240, 340, 420, 480];
  doc.fontSize(9).text('Fecha', columns[0], tableTop);
  doc.text('Concepto', columns[1], tableTop);
  doc.text('Proveedor', columns[2], tableTop);
  doc.text('Ref.', columns[3], tableTop);
  doc.text('Subtotal', columns[4], tableTop, { width: 50, align: 'right' });
  doc.text('Total', columns[5], tableTop, { width: 50, align: 'right' });
  doc.moveDown(0.4);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  let rowY = doc.y + 4;
  gastos.forEach((gasto) => {
    doc.fontSize(9).text(toDateLabel(gasto.fecha), columns[0], rowY);
    doc.text(gasto.concepto || '', columns[1], rowY, { width: 110 });
    doc.text(gasto.proveedor || '', columns[2], rowY, { width: 90 });
    doc.text(gasto.referencia_comprobante || '', columns[3], rowY, { width: 70 });
    doc.text(toCurrency(gasto.subtotal), columns[4], rowY, { width: 50, align: 'right' });
    doc.text(toCurrency(gasto.total), columns[5], rowY, { width: 50, align: 'right' });
    rowY += 16;
    if (rowY > 720) {
      doc.addPage();
      rowY = 40;
    }
  });

  doc.moveDown(1.5);
  doc.fontSize(10).text(`Suma del importe de gastos: ${toCurrency(estimacion.gastos_semana_importe)}`);
  doc.text(`Base para honorarios: ${toCurrency(estimacion.gastos_semana_importe)}`);
  doc.text(
    `Honorarios (${estimacion.honorarios_porcentaje}%): ${toCurrency(estimacion.honorarios_importe)}`
  );
  doc.text(`Total de gastos semana en curso (incluyendo hon): ${toCurrency(estimacion.total_gastos_semana)}`);
  doc.moveDown(0.8);

  doc.fontSize(12).text('Estado de cuenta semana en curso', { underline: true });
  doc.fontSize(10);
  doc.text(`Saldo al iniciar la semana: ${toCurrency(estimacion.saldo_inicial)}`);
  doc.text(`Total de gastos semana en curso: ${toCurrency(estimacion.total_gastos_semana)}`);
  doc.text(`Pagos semana en curso: ${toCurrency(estimacion.pagos_semana)}`);
  doc.text(`Saldo al final de la semana en curso: ${toCurrency(estimacion.saldo_final)}`);
  doc.text(`Total a pagar: ${toCurrency(estimacion.total_a_pagar)}`);

  const endPromise = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  doc.end();

  return await endPromise;
};

module.exports = {
  buildEstimationSnapshot,
  createEstimation,
  listEstimacionesByObra,
  getEstimacionById,
  buildEstimacionPdf
};
