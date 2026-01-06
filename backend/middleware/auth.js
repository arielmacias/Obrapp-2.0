const jwt = require('jsonwebtoken');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  return header.replace('Bearer ', '').trim();
};

const authenticate = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
  } catch (error) {
    req.user = null;
  }
  return next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token inválido o ausente' });
  }
  return next();
};

module.exports = { authenticate, requireAuth };
