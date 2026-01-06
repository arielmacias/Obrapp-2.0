import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useObra } from '../context/ObraContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TIPOS = [
  { value: 'M.O.', label: 'M.O. (Mano de obra)' },
  { value: 'MAT', label: 'MAT (Materiales)' },
  { value: 'CON', label: 'CON (Contratista)' },
  { value: 'IND', label: 'IND (Indirectos)' }
];

const PARTIDAS = [
  'Preliminares',
  'Cimentación',
  'Albañilería y muros',
  'Estructuras y Losas',
  'Instalaciones',
  'Aplanados',
  'Recubrimientos',
  'Pintura y Acabados',
  'Cancelería',
  'Herrería',
  'Carpintería',
  'Indirectos'
];

const initialForm = {
  fecha: new Date().toISOString().slice(0, 10),
  tipo: 'MAT',
  partida: PARTIDAS[0],
  concepto: '',
  proveedor: '',
  comprobante: null,
  referencia_comprobante: '',
  monto: '',
  iva: false,
  estatus_pago: 'PP',
  cuenta_id: ''
};

const GastosView = () => {
  const { obraSeleccionada } = useObra();
  const { role } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [pagoForm, setPagoForm] = useState({ cuenta_id: '', fecha: '', monto: '' });

  const isAdmin = role === 'admin';

  if (!obraSeleccionada) {
    return (
      <div className="card card-wide">
        <h2>Gastos</h2>
        <p className="muted">Selecciona una obra para ver y registrar gastos.</p>
      </div>
    );
  }

  const loadGastos = async () => {
    if (!obraSeleccionada?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.listarGastos(obraSeleccionada.id);
      setGastos(data.gastos || []);
      setPeriodo(data.periodo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCuentas = async () => {
    if (!obraSeleccionada?.id) return;
    try {
      const data = await apiClient.listarCuentas(obraSeleccionada.id);
      setCuentas(data.cuentas || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadGastos();
    loadCuentas();
    setSelectedGasto(null);
  }, [obraSeleccionada?.id]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, comprobante: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!obraSeleccionada?.id) return;
    if (form.estatus_pago === 'P' && !form.cuenta_id) {
      setError('Selecciona una cuenta cuando el gasto está pagado.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'comprobante' && value) {
          body.append('comprobante', value);
        } else if (value !== null && value !== '') {
          body.append(key, value);
        }
      });
      const result = await apiClient.crearGasto(obraSeleccionada.id, body);
      setGastos((prev) => [result.gasto, ...prev]);
      setShowForm(false);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel = useMemo(
    () => ({
      PP: 'Por pagar',
      P: 'Pagado'
    }),
    []
  );

  const handleSelect = async (gastoId) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.obtenerGasto(gastoId);
      setSelectedGasto(data.gasto);
      setShowPago(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedGasto?.id) return;
    if (selectedGasto.estatus_pago === 'P' && !selectedGasto.cuenta_id) {
      setError('Selecciona una cuenta para marcar como pagado.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        estatus_pago: selectedGasto.estatus_pago,
        cuenta_id: selectedGasto.cuenta_id || null
      };
      const data = await apiClient.actualizarGasto(selectedGasto.id, payload);
      setSelectedGasto(data.gasto);
      await loadGastos();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagoSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGasto?.id || !obraSeleccionada?.id) return;
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        cuenta_id: pagoForm.cuenta_id,
        fecha: pagoForm.fecha,
        monto: pagoForm.monto
      };
      await apiClient.registrarPago(obraSeleccionada.id, selectedGasto.id, payload);
      setShowPago(false);
      setPagoForm({ cuenta_id: '', fecha: '', monto: '' });
      await loadGastos();
      const data = await apiClient.obtenerGasto(selectedGasto.id);
      setSelectedGasto(data.gasto);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagoOpen = () => {
    setPagoForm({
      cuenta_id: '',
      fecha: new Date().toISOString().slice(0, 10),
      monto: selectedGasto?.monto || ''
    });
    setShowPago(true);
  };

  return (
    <div className="card card-wide">
      <div className="card-header">
        <div>
          <h2>Gastos — Semana en curso + no pagados</h2>
          {periodo && (
            <p className="muted">
              Periodo: {periodo.inicio} → {periodo.fin}
            </p>
          )}
        </div>
        <button type="button" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cerrar formulario' : 'Registrar gasto'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {isLoading && <p className="muted">Cargando gastos...</p>}

      {!isLoading && (
        <table className="table table-selectable">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Proveedor</th>
              <th>Referencia</th>
              <th>Importe</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id} onClick={() => handleSelect(gasto.id)}>
                <td>{gasto.tipo}</td>
                <td>{gasto.concepto}</td>
                <td>{gasto.proveedor || '-'}</td>
                <td>{gasto.referencia_comprobante || '-'}</td>
                <td>${Number(gasto.monto).toFixed(2)}</td>
                <td>
                  <span className={`status ${gasto.estatus_pago === 'P' ? 'status-success' : 'status-danger'}`}>
                    {statusLabel[gasto.estatus_pago] || gasto.estatus_pago}
                  </span>
                </td>
              </tr>
            ))}
            {gastos.length === 0 && (
              <tr>
                <td colSpan="6" className="muted">
                  No hay gastos en el periodo seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <>
          <div className="divider" />
          <h3>Registrar gasto</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Fecha
              <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required />
            </label>
            <label>
              Tipo
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Partida
              <select name="partida" value={form.partida} onChange={handleChange}>
                {PARTIDAS.map((partida) => (
                  <option key={partida} value={partida}>
                    {partida}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Concepto
              <input name="concepto" value={form.concepto} onChange={handleChange} required />
            </label>
            <label>
              Proveedor
              <input name="proveedor" value={form.proveedor} onChange={handleChange} />
            </label>
            <label>
              Comprobante (PDF/JPG)
              <input name="comprobante" type="file" accept=".pdf,.jpg,.jpeg" onChange={handleChange} />
            </label>
            <label>
              Referencia
              <input
                name="referencia_comprobante"
                value={form.referencia_comprobante}
                onChange={handleChange}
                maxLength={10}
              />
            </label>
            <label>
              Importe
              <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} required />
            </label>
            <label className="checkbox">
              <input name="iva" type="checkbox" checked={form.iva} onChange={handleChange} />
              IVA incluido
            </label>
            <label>
              Status pago
              <select name="estatus_pago" value={form.estatus_pago} onChange={handleChange}>
                <option value="PP">Por pagar</option>
                <option value="P">Pagado</option>
              </select>
            </label>
            <label>
              Cuenta
              <select name="cuenta_id" value={form.cuenta_id} onChange={handleChange}>
                <option value="">Selecciona cuenta</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear gasto'}
            </button>
          </form>
        </>
      )}

      {selectedGasto && (
        <>
          <div className="divider" />
          <h3>Detalle de gasto</h3>
          <div className="detail-grid">
            <div className="detail-card">
              <h4>Información general</h4>
              <p>Fecha: {selectedGasto.fecha?.slice(0, 10)}</p>
              <p>Tipo: {selectedGasto.tipo}</p>
              <p>Partida: {selectedGasto.partida}</p>
              <p>Concepto: {selectedGasto.concepto}</p>
            </div>
            <div className="detail-card">
              <h4>Pago</h4>
              <p>Status: {statusLabel[selectedGasto.estatus_pago]}</p>
              <p>Cuenta: {selectedGasto.cuenta_nombre || 'Sin asignar'}</p>
              <p>Importe: ${Number(selectedGasto.monto).toFixed(2)}</p>
              <p>IVA: {selectedGasto.iva ? 'Sí' : 'No'}</p>
            </div>
            <div className="detail-card">
              <h4>Proveedor</h4>
              <p>{selectedGasto.proveedor || 'Sin proveedor'}</p>
              <p>Referencia: {selectedGasto.referencia_comprobante || '-'}</p>
              {selectedGasto.comprobante_path && (
                <a href={`${API_URL}${selectedGasto.comprobante_path}`} target="_blank" rel="noreferrer">
                  Ver comprobante
                </a>
              )}
            </div>
          </div>

          <div className="form">
            <label>
              Actualizar status
              <select
                value={selectedGasto.estatus_pago}
                onChange={(event) =>
                  setSelectedGasto((prev) => ({ ...prev, estatus_pago: event.target.value }))
                }
              >
                <option value="PP">Por pagar</option>
                <option value="P">Pagado</option>
              </select>
            </label>
            <label>
              Cuenta asociada
              <select
                value={selectedGasto.cuenta_id || ''}
                onChange={(event) =>
                  setSelectedGasto((prev) => ({ ...prev, cuenta_id: event.target.value || null }))
                }
              >
                <option value="">Selecciona cuenta</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar gasto'}
            </button>
          </div>

          {selectedGasto.estatus_pago === 'PP' && isAdmin && (
            <>
              <div className="divider" />
              <button type="button" onClick={handlePagoOpen}>
                Pagar gasto
              </button>
              {showPago && (
                <form className="form" onSubmit={handlePagoSubmit}>
                  <label>
                    Cuenta
                    <select
                      name="cuenta_id"
                      value={pagoForm.cuenta_id}
                      onChange={(event) => setPagoForm((prev) => ({ ...prev, cuenta_id: event.target.value }))}
                      required
                    >
                      <option value="">Selecciona cuenta</option>
                      {cuentas.map((cuenta) => (
                        <option key={cuenta.id} value={cuenta.id}>
                          {cuenta.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Fecha de pago
                    <input
                      name="fecha"
                      type="date"
                      value={pagoForm.fecha}
                      onChange={(event) => setPagoForm((prev) => ({ ...prev, fecha: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Monto
                    <input
                      name="monto"
                      type="number"
                      step="0.01"
                      value={pagoForm.monto}
                      onChange={(event) => setPagoForm((prev) => ({ ...prev, monto: event.target.value }))}
                      required
                    />
                  </label>
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar pago'}
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GastosView;
