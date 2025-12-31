import { useAuth } from '../context/AuthContext';
import { useObra } from '../context/ObraContext';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { obras, obraSeleccionada, setObraSeleccionada } = useObra();

  return (
    <div className="app">
      <header className="header">
        <h1>ObrAPP</h1>
        <div className="header-actions">
          <select
            value={obraSeleccionada?.id}
            onChange={(event) => {
              const selected = obras.find((obra) => obra.id === Number(event.target.value));
              setObraSeleccionada(selected);
            }}
          >
            {obras.map((obra) => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre}
              </option>
            ))}
          </select>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
};

export default Layout;
