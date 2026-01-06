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
  res.status(status).json({ message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
