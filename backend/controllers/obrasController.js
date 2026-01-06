const {
  listObras,
  getObraById,
  createObra,
  updateObra,
  archiveObra
} = require('../services/obrasService');

const listarObras = async (_req, res, next) => {
  try {
    const obras = await listObras();
    return res.json({ obras });
  } catch (error) {
    return next(error);
  }
};

const obtenerObra = async (req, res, next) => {
  try {
    const obra = await getObraById(req.params.obraId);
    return res.json({ obra });
  } catch (error) {
    return next(error);
  }
};

const crearObra = async (req, res, next) => {
  try {
    const { nombre, clave, fecha_inicio, honorarios_porcentaje } = req.body;
    if (!nombre || !clave || !fecha_inicio || honorarios_porcentaje === undefined) {
      return res.status(400).json({
        message: 'Nombre, clave, fecha de inicio y porcentaje de honorarios son obligatorios'
      });
    }

    const obra = await createObra(req.body);
    return res.status(201).json({ obra });
  } catch (error) {
    return next(error);
  }
};

const actualizarObra = async (req, res, next) => {
  try {
    const obra = await updateObra(req.params.obraId, req.body);
    return res.json({ obra });
  } catch (error) {
    return next(error);
  }
};

const archivarObra = async (req, res, next) => {
  try {
    const obra = await archiveObra(req.params.obraId);
    return res.json({ obra });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listarObras, obtenerObra, crearObra, actualizarObra, archivarObra };
