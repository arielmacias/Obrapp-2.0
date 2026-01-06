const jwt = require('jsonwebtoken');

const DUMMY_USERS = [
  {
    id: 1,
    email: 'admin@obrapp.local',
    password: 'password',
    role: 'admin',
    name: 'Admin ObrAPP'
  },
  {
    id: 2,
    email: 'residente@obrapp.local',
    password: 'password',
    role: 'residente',
    name: 'Residente ObrAPP'
  }
];

const authenticateUser = async ({ email, password }) => {
  const user = DUMMY_USERS.find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) {
    return null;
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const secret = process.env.JWT_SECRET || 'dev_secret';
  const options = { expiresIn: '8h' };

  const token = jwt.sign(payload, secret, options);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
};

module.exports = { authenticateUser };
