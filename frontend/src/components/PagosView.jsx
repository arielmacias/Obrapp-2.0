import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useObra } from '../context/ObraContext';

const PagosView = () => {
  const { obraSeleccionada } = useObra();
  const [pagos, setPagos] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPagos = async () => {
    if (!obraSeleccionada?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.listarPagos(obraSeleccionada.id, `?fecha=${fecha}`);
      setPagos(data.pagos || []);
      setPeriodo(data.periodo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, [obraSeleccionada?.id, fecha]);

  if (!obraSeleccionada) {
    return (
      <div className="card card-wide">
        <h2>Pagos</h2>
        <p className="muted">Selecciona una obra para consultar pagos.</p>
      </div>
    );
  }

  return (
    <div className="card card-wide">
      <div className="card-header">
        <div>
          <h2>Pagos</h2>
          {periodo && (
            <p className="muted">
              Semana: {periodo.inicio} → {periodo.fin}
            </p>
          )}
        </div>
        <label className="inline-field">
          Fecha de referencia
          <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {isLoading ? (
        <p className="muted">Cargando pagos...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Cuenta</th>
              <th>Gasto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.fecha?.slice(0, 10)}</td>
                <td>${Number(pago.monto).toFixed(2)}</td>
                <td>{pago.cuenta_nombre || '-'}</td>
                <td>{pago.gasto_id}</td>
              </tr>
            ))}
            {pagos.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">
                  No hay pagos en este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PagosView;
