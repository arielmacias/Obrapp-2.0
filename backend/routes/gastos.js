const express = require('express');
const { obtenerGasto, actualizarGasto } = require('../controllers/gastosController');
const { registrarPago } = require('../controllers/pagosController');

const router = express.Router();

router.get('/gastos/:gastoId', obtenerGasto);
router.patch('/gastos/:gastoId', actualizarGasto);
router.post('/obras/:obraId/gastos/:gastoId/pagos', registrarPago);

module.exports = router;
