const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  listarObras,
  obtenerObra,
  crearObra,
  actualizarObra,
  archivarObra
} = require('../controllers/obrasController');
const { listarCuentas, crearCuenta } = require('../controllers/cuentasController');
const { listarGastos, crearGasto } = require('../controllers/gastosController');
const { listarPagos } = require('../controllers/pagosController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Formato de comprobante no válido. Usa PDF o JPG.'));
    }
    return cb(null, true);
  }
});

router.get('/obras', listarObras);
router.get('/obras/:obraId', obtenerObra);
router.post('/obras', crearObra);
router.put('/obras/:obraId', actualizarObra);
router.patch('/obras/:obraId/archivar', archivarObra);

router.get('/obras/:obraId/cuentas', listarCuentas);
router.post('/obras/:obraId/cuentas', crearCuenta);

router.get('/obras/:obraId/gastos', listarGastos);
router.post('/obras/:obraId/gastos', upload.single('comprobante'), crearGasto);

router.get('/obras/:obraId/pagos', listarPagos);

module.exports = router;
