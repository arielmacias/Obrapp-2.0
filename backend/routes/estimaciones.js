const express = require('express');
const {
  generarEstimacion,
  listarEstimaciones,
  obtenerEstimacion,
  descargarPdf
} = require('../controllers/estimacionesController');

const router = express.Router();

router.post('/obras/:obraId/estimaciones', generarEstimacion);
router.get('/obras/:obraId/estimaciones', listarEstimaciones);
router.get('/estimaciones/:estimacionId', obtenerEstimacion);
router.get('/estimaciones/:estimacionId/pdf', descargarPdf);

module.exports = router;
