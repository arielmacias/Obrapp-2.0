import React, { useEffect, useState } from 'react';
import { createObra, listObras } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const initialForm = {
  nombre_proyecto: '',
  clave: '',
  direccion: '',
  ubicacion: '',
  clientes: '',
  responsable_obra: '',
  fecha_inicio: '',
  porcentaje_honorarios: '',
  estado: 'activa',
};

export default function Obras() {
  const { token, user, logout } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadObras = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listObras(token);
      setObras(data);
    } catch (err) {
      setError(err.message || 'Error al cargar obras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObras();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        porcentaje_honorarios: Number(form.porcentaje_honorarios),
      };
      const created = await createObra(token, payload);
      setObras((prev) => [created, ...prev]);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Error al crear obra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Obras</h1>
          <p>Bienvenido, {user?.nombre}</p>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section style={{ marginTop: 24 }}>
        <h2>Crear Obra</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <input
              name="nombre_proyecto"
              placeholder="Nombre del proyecto"
              value={form.nombre_proyecto}
              onChange={handleChange}
              required
            />
            <input
              name="clave"
              placeholder="Clave (3 caracteres)"
              value={form.clave}
              onChange={handleChange}
              required
            />
            <input
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            <input
              name="ubicacion"
              placeholder="Ubicación"
              value={form.ubicacion}
              onChange={handleChange}
              required
            />
            <input
              name="clientes"
              placeholder="Clientes"
              value={form.clientes}
              onChange={handleChange}
              required
            />
            <input
              name="responsable_obra"
              placeholder="Responsable de obra"
              value={form.responsable_obra}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="porcentaje_honorarios"
              placeholder="% honorarios"
              value={form.porcentaje_honorarios}
              onChange={handleChange}
              required
            />
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="activa">Activa</option>
              <option value="archivada">Archivada</option>
            </select>
          </div>
          <button type="submit" disabled={saving} style={{ marginTop: 16 }}>
            {saving ? 'Creando...' : 'Crear obra'}
          </button>
        </form>
      </section>

      {error ? <p style={{ color: 'crimson', marginTop: 16 }}>{error}</p> : null}

      <section style={{ marginTop: 32 }}>
        <h2>Listado de Obras</h2>
        {loading ? (
          <p>Cargando obras...</p>
        ) : obras.length === 0 ? (
          <p>No hay obras registradas.</p>
        ) : (
          <ul>
            {obras.map((obra) => (
              <li key={obra.id} style={{ marginBottom: 12 }}>
                <strong>{obra.nombre_proyecto}</strong> ({obra.clave}) — {obra.estado}
                <div style={{ fontSize: 14, color: '#444' }}>{obra.direccion}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
