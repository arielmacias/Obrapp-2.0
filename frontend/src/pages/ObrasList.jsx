import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteObraRequest, fetchObrasRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useObra } from "../context/ObraContext.jsx";

const statusStyles = {
  ACTIVA: "bg-green-100 text-green-700",
  PAUSADA: "bg-amber-100 text-amber-700",
  CERRADA: "bg-slate-200 text-slate-700",
};

const ObrasList = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { obraSeleccionada, setObraSeleccionada } = useObra();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadObras = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await fetchObrasRequest();
        setObras(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadObras();
  }, []);

  const handleSelect = (obra) => {
    setObraSeleccionada(obra);
    navigate("/obra");
  };

  const handleEdit = (event, obra) => {
    event.stopPropagation();
    navigate(`/obras/${obra.id}/editar`);
  };

  const handleDelete = async (event, obra) => {
    event.stopPropagation();

    if (!window.confirm(`¿Eliminar la obra "${obra.nombre}"?`)) {
      return;
    }

    setDeletingId(obra.id);
    setError("");
    try {
      await deleteObraRequest(obra.id);
      setObras((prev) => prev.filter((item) => item.id !== obra.id));
      if (obraSeleccionada?.id === obra.id) {
        setObraSeleccionada(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Obras</h1>
          <p className="text-sm text-muted">
            Gestiona las obras de tu equipo y selecciona una para ver el resumen.
          </p>
        </div>
        {isAdmin ? (
          <Button onClick={() => navigate("/obras/nueva")}>+ Nueva obra</Button>
        ) : null}
      </div>

      {loading ? (
        <Card>
          <p className="text-sm text-muted">Cargando obras…</p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}

      {!loading && !error && !obras.length ? (
        <Card>
          <p className="text-sm text-muted">Aún no hay obras creadas.</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {obras.map((obra) => {
          const location = [obra.direccion_ciudad, obra.direccion_estado]
            .filter(Boolean)
            .join(", ");
          return (
            <Card
              key={obra.id}
              onClick={() => handleSelect(obra)}
              className="cursor-pointer transition hover:border-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">{obra.nombre}</h3>
                  <p className="text-xs text-muted">Clave {obra.clave}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[obra.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {obra.status}
                  </span>
                  {isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(event) => handleEdit(event, obra)}
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text transition hover:bg-bg"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, obra)}
                        disabled={deletingId === obra.id}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === obra.id ? "Eliminando…" : "Eliminar"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              {obra.cliente_nombre ? (
                <p className="mt-3 text-sm text-muted">Cliente: {obra.cliente_nombre}</p>
              ) : null}
              {location ? <p className="mt-1 text-sm text-muted">Ubicación: {location}</p> : null}
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default ObrasList;
