import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('demo@obrapp.local');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user);
      navigate('/obras');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>ObrAPP</h1>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '8px 0 16px' }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ display: 'block', width: '100%', margin: '8px 0 16px' }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      {error ? <p style={{ color: 'crimson', marginTop: 16 }}>{error}</p> : null}
    </div>
  );
}
