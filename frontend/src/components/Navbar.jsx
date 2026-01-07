import Brand from "./Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Brand />
        <div className="flex items-center gap-3">
          {user ? (
            <span className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted">
              {user.nombre} · {user.rol}
            </span>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-full border border-border px-4 text-xs font-semibold text-text transition hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
