const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const secret = process.env.JWT_SECRET || 'dev_secret';

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

module.exports = { authenticateToken };
