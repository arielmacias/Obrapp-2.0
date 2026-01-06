const formatDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
};

const formatPeriodo = (inicio, fin) => `${formatDate(inicio)} – ${formatDate(fin)}`;

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));

const EstimacionesList = ({ estimaciones, onSelect, onGenerar, isLoading, error, obraNombre }) => {
  return (
    <section className="card card-wide">
      <header className="card-header">
        <div>
          <h2>Estimaciones — Obra: {obraNombre || 'Sin obra seleccionada'}</h2>
          <p className="muted">Listado semanal de estimaciones por obra.</p>
        </div>
        <button type="button" onClick={onGenerar} disabled={!obraNombre}>
          + Generar estimación
        </button>
      </header>

      {isLoading && <p className="muted">Cargando estimaciones...</p>}
      {error && <p className="error">{error}</p>}

      {!obraNombre && <p className="muted">Selecciona una obra para visualizar estimaciones.</p>}
      {!isLoading && estimaciones.length === 0 && !error && obraNombre && (
        <p className="muted">Aún no hay estimaciones generadas para esta obra.</p>
      )}

      {estimaciones.length > 0 && (
        <table className="table table-selectable">
          <thead>
            <tr>
              <th>Semana</th>
              <th>Periodo</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {estimaciones.map((estimacion) => (
              <tr key={estimacion.id} onClick={() => onSelect(estimacion.id)}>
                <td>{estimacion.semana}</td>
                <td>{formatPeriodo(estimacion.periodo_inicio, estimacion.periodo_fin)}</td>
                <td>{formatCurrency(estimacion.total_a_pagar)}</td>
                <td>
                  <span className="status">{estimacion.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default EstimacionesList;
