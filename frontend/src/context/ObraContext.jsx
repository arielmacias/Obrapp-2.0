import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "obraSeleccionada";

const ObraContext = createContext(null);

export const ObraProvider = ({ children }) => {
  const [obraSeleccionada, setObraSeleccionadaState] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setObraSeleccionadaState(JSON.parse(stored));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (obraSeleccionada) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obraSeleccionada));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [obraSeleccionada]);

  const setObraSeleccionada = useCallback((obra) => {
    setObraSeleccionadaState(obra);
  }, []);

  const value = useMemo(
    () => ({ obraSeleccionada, setObraSeleccionada }),
    [obraSeleccionada, setObraSeleccionada]
  );

  return <ObraContext.Provider value={value}>{children}</ObraContext.Provider>;
};

export const useObra = () => useContext(ObraContext);
