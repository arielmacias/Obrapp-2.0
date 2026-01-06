const { crearPago, listPagosByObra } = require('../services/pagosService');

const registrarPago = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Solo un admin puede registrar pagos' });
    }
    const { obraId, gastoId } = req.params;
    const { cuenta_id, monto, fecha } = req.body;

    if (!cuenta_id || !monto || !fecha) {
      return res.status(400).json({ message: 'Cuenta, monto y fecha son obligatorios' });
    }

    const pago = await crearPago({
      obraId,
      gastoId,
      cuentaId: cuenta_id,
      monto,
      fecha
    });
    return res.status(201).json({ pago });
  } catch (error) {
    return next(error);
  }
};

const listarPagos = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const data = await listPagosByObra({ obraId: req.params.obraId, fechaReferencia: fecha });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { registrarPago, listarPagos };
