import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const ObraContext = createContext();
const OBRA_KEY = 'obrapp_obra_id';

export const ObraProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [obras, setObras] = useState([]);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadObras = useCallback(async () => {
    if (!isAuthenticated) {
      setObras([]);
      setObraSeleccionada(null);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.listarObras();
      const lista = data.obras || [];
      setObras(lista);
      const storedId = Number(localStorage.getItem(OBRA_KEY));
      const selected = lista.find((obra) => obra.id === storedId) || lista[0] || null;
      setObraSeleccionada(selected);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadObras();
  }, [loadObras]);

  useEffect(() => {
    if (obraSeleccionada?.id) {
      localStorage.setItem(OBRA_KEY, String(obraSeleccionada.id));
    }
  }, [obraSeleccionada?.id]);

  const value = useMemo(
    () => ({
      obras,
      obraSeleccionada,
      setObraSeleccionada,
      reloadObras: loadObras,
      isLoading,
      error
    }),
    [obras, obraSeleccionada, loadObras, isLoading, error]
  );

  return <ObraContext.Provider value={value}>{children}</ObraContext.Provider>;
};

export const useObra = () => {
  const context = useContext(ObraContext);
  if (!context) {
    throw new Error('useObra debe usarse dentro de ObraProvider');
  }
  return context;
};
