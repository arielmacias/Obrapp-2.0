import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card.jsx";
import { useObra } from "../context/ObraContext.jsx";

const ObraResumen = () => {
  const { obraSeleccionada } = useObra();
  const navigate = useNavigate();

  useEffect(() => {
    if (!obraSeleccionada) {
      navigate("/obras", { replace: true });
    }
  }, [obraSeleccionada, navigate]);

  if (!obraSeleccionada) {
    return null;
  }

  const location = [
    obraSeleccionada.direccion_calle,
    obraSeleccionada.direccion_numero,
    obraSeleccionada.direccion_colonia,
    obraSeleccionada.direccion_ciudad,
    obraSeleccionada.direccion_estado,
    obraSeleccionada.direccion_cp,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Resumen de obra</p>
            <h1 className="text-2xl font-semibold text-text">{obraSeleccionada.nombre}</h1>
          </div>
          <span className="rounded-full border border-border bg-bg px-4 py-2 text-xs font-semibold text-muted">
            {obraSeleccionada.status}
          </span>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-text">Datos clave</h2>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>
              <span className="font-semibold text-text">Clave:</span> {obraSeleccionada.clave}
            </p>
            {obraSeleccionada.cliente_nombre ? (
              <p>
                <span className="font-semibold text-text">Cliente:</span>{" "}
                {obraSeleccionada.cliente_nombre}
              </p>
            ) : null}
            {obraSeleccionada.fecha_inicio ? (
              <p>
                <span className="font-semibold text-text">Inicio:</span>{" "}
                {obraSeleccionada.fecha_inicio}
              </p>
            ) : null}
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-text">Ubicación</h2>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>{location || "Sin dirección capturada"}</p>
            {obraSeleccionada.lat && obraSeleccionada.lng ? (
              <p>
                Coordenadas: {obraSeleccionada.lat}, {obraSeleccionada.lng}
              </p>
            ) : (
              <p>Sin coordenadas asignadas</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-text">Portada</h2>
        <div className="mt-4 text-sm text-muted">
          {obraSeleccionada.portada_url ? (
            <a
              href={obraSeleccionada.portada_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              {obraSeleccionada.portada_url}
            </a>
          ) : (
            <p>Sin portada asignada</p>
          )}
        </div>
      </Card>
    </main>
  );
};

export default ObraResumen;
