import { useAuth } from '../context/AuthContext';
import { useObra } from '../context/ObraContext';

const Layout = ({ children, activeView, onNavigate }) => {
  const { logout, user } = useAuth();
  const { obras, obraSeleccionada, setObraSeleccionada } = useObra();

  return (
    <div className="app">
      <header className="header">
        <h1>ObrAPP</h1>
        <div className="header-actions">
          <div className="user-pill">{user?.role ? `${user.role.toUpperCase()}` : 'SIN ROL'}</div>
          <select
            value={obraSeleccionada?.id || ''}
            onChange={(event) => {
              const selected = obras.find((obra) => obra.id === Number(event.target.value));
              setObraSeleccionada(selected || null);
            }}
            disabled={obras.length === 0}
          >
            {obras.length === 0 ? <option value="">Sin obras</option> : null}
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
      <nav className="nav">
        {[
          { id: 'obras', label: 'Obras' },
          { id: 'gastos', label: 'Gastos' },
          { id: 'pagos', label: 'Pagos' },
          { id: 'estimaciones', label: 'Estimaciones' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeView === item.id ? 'nav-active' : 'button-ghost'}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main className="content">{children}</main>
    </div>
  );
};

export default Layout;
