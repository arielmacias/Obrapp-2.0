const jwt = require('jsonwebtoken');

const DUMMY_USER = {
  id: 1,
  email: 'admin@obrapp.local',
  password: 'password'
};

const authenticateUser = async ({ email, password }) => {
  if (email !== DUMMY_USER.email || password !== DUMMY_USER.password) {
    return null;
  }

  const payload = {
    sub: DUMMY_USER.id,
    email: DUMMY_USER.email
  };

  const secret = process.env.JWT_SECRET || 'dev_secret';
  const options = { expiresIn: '8h' };

  return jwt.sign(payload, secret, options);
};

module.exports = { authenticateUser };
