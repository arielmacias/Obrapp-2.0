import { useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useObra } from '../context/ObraContext';

const initialForm = {
  nombre: '',
  clave: '',
  direccion: '',
  ubicacion: '',
  cliente: '',
  responsable: '',
  fecha_inicio: '',
  honorarios_porcentaje: '',
  estado: 'activa'
};

const ObrasView = () => {
  const { obras, obraSeleccionada, setObraSeleccionada, reloadObras, isLoading, error } = useObra();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuentaNombre, setCuentaNombre] = useState('');
  const [actionError, setActionError] = useState('');

  const title = useMemo(() => (editingId ? 'Editar obra' : 'Alta de obra'), [editingId]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEdit = (obra) => {
    setEditingId(obra.id);
    setForm({
      nombre: obra.nombre || '',
      clave: obra.clave || '',
      direccion: obra.direccion || '',
      ubicacion: obra.ubicacion || '',
      cliente: obra.cliente || '',
      responsable: obra.responsable || '',
      fecha_inicio: obra.fecha_inicio ? obra.fecha_inicio.slice(0, 10) : '',
      honorarios_porcentaje: obra.honorarios_porcentaje ?? '',
      estado: obra.estado || 'activa'
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setActionError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setActionError('');
    try {
      if (editingId) {
        await apiClient.actualizarObra(editingId, form);
      } else {
        await apiClient.crearObra(form);
      }
      await reloadObras();
      resetForm();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (obraId) => {
    setActionError('');
    try {
      await apiClient.archivarObra(obraId);
      await reloadObras();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCrearCuenta = async () => {
    if (!obraSeleccionada?.id || !cuentaNombre.trim()) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await apiClient.crearCuenta(obraSeleccionada.id, { nombre: cuentaNombre.trim() });
      setCuentaNombre('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card card-wide">
      <div className="card-header">
        <div>
          <h2>Obras</h2>
          <p className="muted">Listado y alta de obras activas/archivadas.</p>
        </div>
        <button type="button" className="button-ghost" onClick={resetForm}>
          {editingId ? 'Nueva obra' : 'Limpiar'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {actionError && <p className="error">{actionError}</p>}

      {isLoading ? (
        <p className="muted">Cargando obras...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Clave</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id}>
                <td>{obra.nombre}</td>
                <td>{obra.clave}</td>
                <td>{obra.responsable || 'Sin asignar'}</td>
                <td>{obra.estado}</td>
                <td className="actions">
                  <button type="button" className="button-ghost" onClick={() => setObraSeleccionada(obra)}>
                    {obraSeleccionada?.id === obra.id ? 'Seleccionada' : 'Seleccionar'}
                  </button>
                  <button type="button" className="button-ghost" onClick={() => handleEdit(obra)}>
                    Editar
                  </button>
                  {obra.estado !== 'archivada' && (
                    <button type="button" className="button-ghost" onClick={() => handleArchive(obra.id)}>
                      Archivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {obras.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">
                  No hay obras registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="divider" />

      <h3>{title}</h3>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Nombre del proyecto
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Clave (3 caracteres)
          <input name="clave" value={form.clave} onChange={handleChange} maxLength={10} required />
        </label>
        <label>
          Dirección
          <input name="direccion" value={form.direccion} onChange={handleChange} />
        </label>
        <label>
          Ubicación (mapa)
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} />
        </label>
        <label>
          Cliente(s)
          <input name="cliente" value={form.cliente} onChange={handleChange} />
        </label>
        <label>
          Responsable de obra
          <input name="responsable" value={form.responsable} onChange={handleChange} />
        </label>
        <label>
          Fecha de inicio
          <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} required />
        </label>
        <label>
          Porcentaje de honorarios
          <input
            name="honorarios_porcentaje"
            type="number"
            step="0.01"
            value={form.honorarios_porcentaje}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Estado
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="activa">Activa</option>
            <option value="archivada">Archivada</option>
          </select>
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar obra' : 'Crear obra'}
        </button>
      </form>

      <div className="divider" />
      <h3>Cuentas internas</h3>
      <p className="muted">Crea una cuenta por obra para asociar pagos y gastos.</p>
      <div className="form">
        <label>
          Nueva cuenta (obra seleccionada)
          <input
            value={cuentaNombre}
            onChange={(event) => setCuentaNombre(event.target.value)}
            placeholder="Ej. Caja chica"
          />
        </label>
        <button type="button" onClick={handleCrearCuenta} disabled={isSubmitting || !obraSeleccionada}>
          {isSubmitting ? 'Creando...' : 'Crear cuenta'}
        </button>
      </div>
    </div>
  );
};

export default ObrasView;
