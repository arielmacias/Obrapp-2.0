import { Link, NavLink } from "react-router-dom";

import Brand from "./Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/obras" className="flex items-center gap-2">
          <Brand />
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex items-center gap-3 text-xs font-semibold text-muted">
            <NavLink
              to="/obras"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive ? "bg-bg text-text" : "hover:text-text"
                }`
              }
            >
              Obras
            </NavLink>
            <NavLink
              to="/obra"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive ? "bg-bg text-text" : "hover:text-text"
                }`
              }
            >
              Resumen
            </NavLink>
            <NavLink
              to="/gastos"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive ? "bg-bg text-text" : "hover:text-text"
                }`
              }
            >
              Gastos
            </NavLink>
            {isAdmin ? (
              <NavLink
                to="/cuentas"
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive ? "bg-bg text-text" : "hover:text-text"
                  }`
                }
              >
                Cuentas
              </NavLink>
            ) : null}
          </nav>
          {user ? (
            <span className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted">
              {user.nombre} · {user.role}
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
