import { useEffect, useState } from 'react';
import apiClient from '../api/client';

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

const GenerarEstimacionModal = ({ obraId, isOpen, onClose, onGenerated }) => {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !obraId) {
      return;
    }

    const fetchPreview = async () => {
      setIsLoading(true);
      setError('');
      setPreview(null);
      try {
        const data = await apiClient.previsualizarEstimacion(obraId, {});
        setPreview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [isOpen, obraId]);

  const handleGenerate = async () => {
    if (!obraId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.generarEstimacion(obraId, {});
      onGenerated(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h3>Generar estimación semanal</h3>
          <button type="button" className="button-ghost" onClick={onClose}>
            ✕
          </button>
        </header>

        {isLoading && <p className="muted">Calculando resumen...</p>}
        {error && <p className="error">{error}</p>}

        {preview && (
          <div className="modal-body">
            <div className="field-group">
              <span className="label">Periodo sugerido</span>
              <p className="value">
                {formatDate(preview.periodo.inicio)} → {formatDate(preview.periodo.fin)}
              </p>
            </div>

            <div className="field-group">
              <span className="label">Resumen previo</span>
              <div className="summary-grid">
                <div>
                  <p className="muted">Gastos totales</p>
                  <strong>{formatCurrency(preview.resumenPrevio.gastosTotales)}</strong>
                </div>
                <div>
                  <p className="muted">Pagados</p>
                  <strong>{formatCurrency(preview.resumenPrevio.pagados)}</strong>
                </div>
                <div>
                  <p className="muted">Por pagar</p>
                  <strong>{formatCurrency(preview.resumenPrevio.porPagar)}</strong>
                </div>
                <div>
                  <p className="muted">Cuentas afectadas</p>
                  <strong>{preview.resumenPrevio.cuentasAfectadas}</strong>
                </div>
              </div>
            </div>

            <p className="warning">⚠️ Esta acción generará un corte financiero.</p>
          </div>
        )}

        <footer className="modal-actions">
          <button type="button" className="button-ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="button" onClick={handleGenerate} disabled={isLoading}>
            Generar estimación
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GenerarEstimacionModal;
