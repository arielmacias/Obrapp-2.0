const { authenticateUser } = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const token = await authenticateUser({ email, password });

    if (!token) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login };
