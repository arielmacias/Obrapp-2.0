const { authenticateUser } = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const authResult = await authenticateUser({ email, password });

    if (!authResult) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json(authResult);
  } catch (error) {
    return next(error);
  }
};

module.exports = { login };
