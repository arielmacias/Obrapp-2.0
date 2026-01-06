const {
  buildEstimationSnapshot,
  createEstimation,
  listEstimacionesByObra,
  getEstimacionById,
  buildEstimacionPdf
} = require('../services/estimacionesService');

const generarEstimacion = async (req, res, next) => {
  try {
    const obraId = Number(req.params.obraId);
    const { fecha, generadoPor } = req.body || {};
    const preview = req.query.preview === 'true';

    if (!obraId) {
      return res.status(400).json({ message: 'La obra es requerida' });
    }

    if (preview) {
      const snapshot = await buildEstimationSnapshot({ obraId, fecha });
      return res.json({ preview: true, ...snapshot });
    }

    const estimacionId = await createEstimation({ obraId, fecha, generadoPor });
    const estimacion = await getEstimacionById(estimacionId);
    return res.status(201).json(estimacion);
  } catch (error) {
    return next(error);
  }
};

const listarEstimaciones = async (req, res, next) => {
  try {
    const obraId = Number(req.params.obraId);
    if (!obraId) {
      return res.status(400).json({ message: 'La obra es requerida' });
    }
    const estimaciones = await listEstimacionesByObra(obraId);
    return res.json({ estimaciones });
  } catch (error) {
    return next(error);
  }
};

const obtenerEstimacion = async (req, res, next) => {
  try {
    const estimacionId = Number(req.params.estimacionId);
    if (!estimacionId) {
      return res.status(400).json({ message: 'La estimación es requerida' });
    }
    const estimacion = await getEstimacionById(estimacionId);
    return res.json(estimacion);
  } catch (error) {
    return next(error);
  }
};

const descargarPdf = async (req, res, next) => {
  try {
    const estimacionId = Number(req.params.estimacionId);
    if (!estimacionId) {
      return res.status(400).json({ message: 'La estimación es requerida' });
    }
    const pdfBuffer = await buildEstimacionPdf(estimacionId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estimacion-${estimacionId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generarEstimacion,
  listarEstimaciones,
  obtenerEstimacion,
  descargarPdf
};
