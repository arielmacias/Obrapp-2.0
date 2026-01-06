import { useCallback, useEffect, useState } from 'react';
import apiClient from './api/client';
import { useAuth } from './context/AuthContext';
import { useObra } from './context/ObraContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import EstimacionesList from './components/EstimacionesList';
import EstimacionDetalle from './components/EstimacionDetalle';
import GenerarEstimacionModal from './components/GenerarEstimacionModal';

const App = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { obraSeleccionada } = useObra();
  const [estimaciones, setEstimaciones] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadEstimaciones = useCallback(async () => {
    if (!obraSeleccionada?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.listarEstimaciones(obraSeleccionada.id);
      setEstimaciones(data.estimaciones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [obraSeleccionada?.id]);

  useEffect(() => {
    setDetalle(null);
    loadEstimaciones();
  }, [obraSeleccionada?.id, loadEstimaciones]);

  const isHydrating = isAuthLoading || (isAuthenticated && !obraSeleccionada);

  if (isHydrating) {
    return <div className="centered">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="centered">
        <LoginForm />
      </div>
    );
  }

  const handleSelect = async (estimacionId) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.obtenerEstimacion(estimacionId);
      setDetalle(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerated = (data) => {
    setIsModalOpen(false);
    setDetalle(data);
    loadEstimaciones();
  };

  const handleDownload = async () => {
    if (!detalle?.estimacion?.id) return;
    setIsDownloading(true);
    try {
      const blob = await apiClient.descargarPdfEstimacion(detalle.estimacion.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estimacion-${detalle.estimacion.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      {detalle ? (
        <EstimacionDetalle
          detalle={detalle}
          onBack={() => setDetalle(null)}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          error={error}
        />
      ) : (
        <EstimacionesList
          estimaciones={estimaciones}
          onSelect={handleSelect}
          onGenerar={() => setIsModalOpen(true)}
          isLoading={isLoading}
          error={error}
          obraNombre={obraSeleccionada?.nombre}
        />
      )}

      <GenerarEstimacionModal
        obraId={obraSeleccionada?.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerated={handleGenerated}
      />
    </Layout>
  );
};

export default App;
