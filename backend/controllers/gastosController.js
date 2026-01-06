const { createGasto, listGastosByObra, getGastoById, updateGasto } = require('../services/gastosService');

const listarGastos = async (req, res, next) => {
  try {
    const { fecha, incluirNoPagados = 'true' } = req.query;
    const data = await listGastosByObra({
      obraId: req.params.obraId,
      fechaReferencia: fecha,
      incluirNoPagados: incluirNoPagados !== 'false'
    });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

const obtenerGasto = async (req, res, next) => {
  try {
    const gasto = await getGastoById(req.params.gastoId);
    return res.json({ gasto });
  } catch (error) {
    return next(error);
  }
};

const crearGasto = async (req, res, next) => {
  try {
    const {
      tipo,
      partida,
      concepto,
      monto,
      fecha,
      estatus_pago,
      cuenta_id
    } = req.body;

    if (!tipo || !partida || !concepto || !monto || !fecha) {
      return res.status(400).json({
        message: 'Tipo, partida, concepto, monto y fecha son obligatorios'
      });
    }

    if (estatus_pago === 'P' && !cuenta_id) {
      return res.status(400).json({ message: 'Cuenta es requerida cuando el gasto está pagado' });
    }

    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;
    const gasto = await createGasto({
      obraId: req.params.obraId,
      payload: req.body,
      comprobantePath
    });
    return res.status(201).json({ gasto });
  } catch (error) {
    return next(error);
  }
};

const actualizarGasto = async (req, res, next) => {
  try {
    const gasto = await updateGasto(req.params.gastoId, req.body);
    return res.json({ gasto });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listarGastos, obtenerGasto, crearGasto, actualizarGasto };
