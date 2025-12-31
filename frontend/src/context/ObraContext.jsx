import { createContext, useContext, useMemo, useState } from 'react';

const ObraContext = createContext();

const MOCK_OBRAS = [
  { id: 1, nombre: 'Obra Centro' },
  { id: 2, nombre: 'Obra Norte' }
];

export const ObraProvider = ({ children }) => {
  const [obras] = useState(MOCK_OBRAS);
  const [obraSeleccionada, setObraSeleccionada] = useState(MOCK_OBRAS[0]);

  const value = useMemo(
    () => ({ obras, obraSeleccionada, setObraSeleccionada }),
    [obras, obraSeleccionada]
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
