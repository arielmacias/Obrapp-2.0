import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createObraRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useObra } from "../context/ObraContext.jsx";

const statusOptions = ["ACTIVA", "PAUSADA", "CERRADA"];

const ObraNueva = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setObraSeleccionada } = useObra();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    clave: "",
    cliente_nombre: "",
    status: "ACTIVA",
    fecha_inicio: "",
    direccion_estado: "",
    direccion_ciudad: "",
    direccion_colonia: "",
    direccion_calle: "",
    direccion_numero: "",
    direccion_cp: "",
    portada_url: "",
    lat: "",
    lng: "",
  });

  const canCreate = user?.role === "admin";

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "clave") {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase().slice(0, 3) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validation = useMemo(() => {
    const errors = {};
    if (!form.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    }
    if (!/^[A-Z0-9]{3}$/.test(form.clave)) {
      errors.clave = "Debe tener 3 caracteres alfanuméricos";
    }
    return errors;
  }, [form.clave, form.nombre]);

  const buildPayload = () => {
    const payload = {
      nombre: form.nombre.trim(),
      clave: form.clave.trim(),
      cliente_nombre: form.cliente_nombre.trim(),
      status: form.status,
      fecha_inicio: form.fecha_inicio || undefined,
      direccion_estado: form.direccion_estado.trim(),
      direccion_ciudad: form.direccion_ciudad.trim(),
      direccion_colonia: form.direccion_colonia.trim(),
      direccion_calle: form.direccion_calle.trim(),
      direccion_numero: form.direccion_numero.trim(),
      direccion_cp: form.direccion_cp.trim(),
      portada_url: form.portada_url.trim(),
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) {
        delete payload[key];
      }
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!canCreate) {
      setError("Solo los administradores pueden crear obras.");
      return;
    }

    if (Object.keys(validation).length) {
      setError("Revisa los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await createObraRequest(buildPayload());
      setObraSeleccionada(data);
      navigate("/obra");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const coordsStatus = form.lat && form.lng ? "Asignada ✓" : "No asignada";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text">Nueva obra</h1>
            <p className="text-sm text-muted">
              Completa los datos esenciales y define ubicación si la tienes.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/obras")}>Volver</Button>
        </div>
      </Card>

      <Card>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="nombre"
              name="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Obra Paseo Norte"
              required
              error={validation.nombre}
            />
            <Input
              id="clave"
              name="clave"
              label="Clave"
              value={form.clave}
              onChange={handleChange}
              placeholder="ABC"
              required
              helper="3 caracteres en mayúsculas"
              error={validation.clave}
            />
            <Input
              id="cliente_nombre"
              name="cliente_nombre"
              label="Cliente"
              value={form.cliente_nombre}
              onChange={handleChange}
              placeholder="Cliente opcional"
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium text-text">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text shadow-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="fecha_inicio"
              name="fecha_inicio"
              label="Fecha inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={handleChange}
            />
            <Input
              id="portada_url"
              name="portada_url"
              label="Portada URL"
              value={form.portada_url}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-text">Dirección</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                id="direccion_estado"
                name="direccion_estado"
                label="Estado"
                value={form.direccion_estado}
                onChange={handleChange}
              />
              <Input
                id="direccion_ciudad"
                name="direccion_ciudad"
                label="Ciudad"
                value={form.direccion_ciudad}
                onChange={handleChange}
              />
              <Input
                id="direccion_colonia"
                name="direccion_colonia"
                label="Colonia"
                value={form.direccion_colonia}
                onChange={handleChange}
              />
              <Input
                id="direccion_calle"
                name="direccion_calle"
                label="Calle"
                value={form.direccion_calle}
                onChange={handleChange}
              />
              <Input
                id="direccion_numero"
                name="direccion_numero"
                label="No."
                value={form.direccion_numero}
                onChange={handleChange}
              />
              <Input
                id="direccion_cp"
                name="direccion_cp"
                label="CP"
                value={form.direccion_cp}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-bg px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-text">Ubicación en mapa</h3>
                <p className="text-xs text-muted">Estado: {coordsStatus}</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowMap(true)}>
                Seleccionar en mapa
              </Button>
            </div>
            {form.lat && form.lng ? (
              <p className="text-xs text-muted">
                Coordenadas: {form.lat}, {form.lng}
              </p>
            ) : null}
          </div>

          {!canCreate ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Tu perfil es {user?.role}. Solo administradores pueden crear obras.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <Button type="submit" isLoading={loading} disabled={!canCreate}>
            Crear obra
          </Button>
        </form>
      </Card>

      {showMap ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <Card className="w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Seleccionar ubicación</h3>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="text-sm font-semibold text-muted"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-bg px-6 py-10 text-center text-sm text-muted">
              Mapa no disponible en este entorno. Usa las coordenadas manuales si lo deseas.
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="mt-4 text-xs font-semibold text-accent"
            >
              {showAdvanced ? "Ocultar avanzado" : "Mostrar avanzado"}
            </button>
            {showAdvanced ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  id="lat"
                  name="lat"
                  label="Latitud"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="Ej. 19.432608"
                />
                <Input
                  id="lng"
                  name="lng"
                  label="Longitud"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="Ej. -99.133209"
                />
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowMap(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => setShowMap(false)}>
                Confirmar ubicación
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
};

export default ObraNueva;
