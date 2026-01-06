require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('../routes/auth');
const obrasRoutes = require('../routes/obras');
const gastosRoutes = require('../routes/gastos');
const estimacionesRoutes = require('../routes/estimaciones');
const { authenticate, requireAuth } = require('../middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(authenticate);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);
app.use('/api', obrasRoutes);
app.use('/api', gastosRoutes);
app.use('/api', estimacionesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  let message = err.message || 'Error interno del servidor';
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    message = 'No se pudo autenticar con la base de datos. Revisa usuario y contraseña.';
  } else if (err.code === 'ER_BAD_DB_ERROR') {
    message = 'No se encontró la base de datos configurada. Revisa el nombre de la BD.';
  }
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
