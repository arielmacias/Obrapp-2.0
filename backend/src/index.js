require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const obrasRoutes = require('./routes/obras');
const requireAuth = require('./middleware/requireAuth');
const { initializeDatabase } = require('./initDatabase');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/obras', requireAuth, obrasRoutes);

const port = process.env.PORT || 4000;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database.');
    console.error(error);
    process.exit(1);
  });
