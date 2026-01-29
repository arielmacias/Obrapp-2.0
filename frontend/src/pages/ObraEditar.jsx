import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchObraRequest, updateObraRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ObraForm from "../components/ObraForm.jsx";
import { useObra } from "../context/ObraContext.jsx";
import { buildObraPayload, validateObraForm } from "../utils/obras.js";

const buildInitialForm = (obra) => ({
  nombre: obra?.nombre || "",
  clave: obra?.clave || "",
  cliente_nombre: obra?.cliente_nombre || "",
  status: obra?.status || "ACTIVA",
  fecha_inicio: obra?.fecha_inicio || "",
  direccion_estado: obra?.direccion_estado || "",
  direccion_ciudad: obra?.direccion_ciudad || "",
  direccion_colonia: obra?.direccion_colonia || "",
  direccion_calle: obra?.direccion_calle || "",
  direccion_numero: obra?.direccion_numero || "",
  direccion_cp: obra?.direccion_cp || "",
  portada_url: obra?.portada_url || "",
});

const ObraEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setObraSeleccionada } = useObra();
  const [form, setForm] = useState(() => buildInitialForm());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadObra = async () => {
      setFetching(true);
      setError("");
      try {
        const { data } = await fetchObraRequest(id);
        setForm(buildInitialForm(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      loadObra();
    }
  }, [id]);

  const validation = useMemo(() => validateObraForm(form), [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "clave") {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase().slice(0, 3) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Object.keys(validation).length) {
      setError("Revisa los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await updateObraRequest(id, buildObraPayload(form));
      setObraSeleccionada(data);
      navigate("/obra");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text">Editar obra</h1>
            <p className="text-sm text-muted">Ajusta los datos clave y guarda los cambios.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/obras")}>
            Volver
          </Button>
        </div>
      </Card>

      {fetching ? (
        <Card>
          <p className="text-sm text-muted">Cargando obra…</p>
        </Card>
      ) : null}

      {error && !fetching ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}

      {!fetching && !error ? (
        <ObraForm
          form={form}
          validation={validation}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="Guardar cambios"
          disabled={loading}
        />
      ) : null}
    </main>
  );
};

export default ObraEditar;
