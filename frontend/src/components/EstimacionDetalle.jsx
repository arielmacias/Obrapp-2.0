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

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));

const EstimacionDetalle = ({ detalle, onBack, onDownload, isDownloading, error }) => {
  if (!detalle) return null;

  const { estimacion, gastos } = detalle;

  return (
    <section className="card card-wide">
      <header className="card-header">
        <div>
          <h2>Estimación semanal</h2>
          <p className="muted">
            Periodo: {formatDate(estimacion.periodo_inicio)} – {formatDate(estimacion.periodo_fin)}
          </p>
          <p className="muted">
            Generada el: {formatDate(estimacion.fecha_generacion)} · por {estimacion.generado_por || 'Sistema'}
          </p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={onDownload} disabled={isDownloading}>
            Descargar PDF
          </button>
          <button type="button" className="button-ghost" onClick={onBack}>
            Volver
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="detail-grid">
        <div className="detail-card">
          <h4>Datos de obra</h4>
          <p>{estimacion.obra_nombre}</p>
          <p className="muted">{estimacion.direccion || 'Sin dirección registrada'}</p>
          <p className="muted">Cliente: {estimacion.cliente || 'Sin cliente registrado'}</p>
        </div>
        <div className="detail-card">
          <h4>Estado de cuenta semana anterior</h4>
          <p>Pago semana anterior: {formatCurrency(estimacion.pago_semana_anterior)}</p>
          <p>Saldo semana anterior: {formatCurrency(estimacion.saldo_semana_anterior)}</p>
          <p>Saldo al iniciar la semana: {formatCurrency(estimacion.saldo_inicial)}</p>
        </div>
        <div className="detail-card">
          <h4>Gastos de la semana en curso</h4>
          <p>Gastos: {formatCurrency(estimacion.gastos_semana_importe)}</p>
          <p>
            Honorarios ({estimacion.honorarios_porcentaje}%): {formatCurrency(estimacion.honorarios_importe)}
          </p>
          <p>Total gastos: {formatCurrency(estimacion.total_gastos_semana)}</p>
        </div>
        <div className="detail-card">
          <h4>Estado de cuenta semana en curso</h4>
          <p>Pagos semana en curso: {formatCurrency(estimacion.pagos_semana)}</p>
          <p>Saldo final: {formatCurrency(estimacion.saldo_final)}</p>
          <p>Total a pagar: {formatCurrency(estimacion.total_a_pagar)}</p>
        </div>
      </div>

      <div className="table-wrapper">
        <h3>Detalle de gastos</h3>
        {gastos.length === 0 ? (
          <p className="muted">No hay gastos registrados en este periodo.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Proveedor</th>
                <th>Referencia</th>
                <th>Subtotal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto, index) => (
                <tr key={`${gasto.fecha}-${index}`}>
                  <td>{formatDate(gasto.fecha)}</td>
                  <td>{gasto.concepto}</td>
                  <td>{gasto.proveedor}</td>
                  <td>{gasto.referencia_comprobante}</td>
                  <td>{formatCurrency(gasto.subtotal)}</td>
                  <td>{formatCurrency(gasto.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default EstimacionDetalle;
