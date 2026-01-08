import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchObrasRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
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
  const navigate = useNavigate();
  const { setObraSeleccionada } = useObra();

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Obras</h1>
          <p className="text-sm text-muted">
            Gestiona las obras de tu equipo y selecciona una para ver el resumen.
          </p>
        </div>
        <Button onClick={() => navigate("/obras/nueva")}>+ Nueva obra</Button>
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
            <button
              key={obra.id}
              type="button"
              onClick={() => handleSelect(obra)}
              className="text-left"
            >
              <Card className="transition hover:border-accent">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text">{obra.nombre}</h3>
                    <p className="text-xs text-muted">Clave {obra.clave}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[obra.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {obra.status}
                  </span>
                </div>
                {obra.cliente_nombre ? (
                  <p className="mt-3 text-sm text-muted">Cliente: {obra.cliente_nombre}</p>
                ) : null}
                {location ? (
                  <p className="mt-1 text-sm text-muted">Ubicación: {location}</p>
                ) : null}
              </Card>
            </button>
          );
        })}
      </div>
    </main>
  );
};

export default ObrasList;
