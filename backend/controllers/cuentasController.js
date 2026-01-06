const { listCuentasByObra, createCuenta } = require('../services/cuentasService');

const listarCuentas = async (req, res, next) => {
  try {
    const cuentas = await listCuentasByObra(req.params.obraId);
    return res.json({ cuentas });
  } catch (error) {
    return next(error);
  }
};

const crearCuenta = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'Nombre de cuenta requerido' });
    }
    const cuenta = await createCuenta(req.params.obraId, nombre);
    return res.status(201).json({ cuenta });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listarCuentas, crearCuenta };
