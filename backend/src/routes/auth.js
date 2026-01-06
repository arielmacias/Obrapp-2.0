const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y password son requeridos' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, nombre, password_hash FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const hashed = hashPassword(password);

    if (user.password_hash !== hashed) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, nombre: user.nombre },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;
