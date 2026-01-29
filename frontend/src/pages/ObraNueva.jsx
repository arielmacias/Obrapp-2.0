import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createObraRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ObraForm from "../components/ObraForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useObra } from "../context/ObraContext.jsx";
import { buildObraPayload, validateObraForm } from "../utils/obras.js";

const ObraNueva = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setObraSeleccionada } = useObra();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const validation = useMemo(() => validateObraForm(form), [form]);

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
      const { data } = await createObraRequest(buildObraPayload(form));
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
            <h1 className="text-2xl font-semibold text-text">Nueva obra</h1>
            <p className="text-sm text-muted">
              Completa los datos esenciales y define ubicación si la tienes.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/obras")}>Volver</Button>
        </div>
      </Card>

      <ObraForm
        form={form}
        validation={validation}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Crear obra"
        disabled={!canCreate}
        notice={
          !canCreate
            ? `Tu perfil es ${user?.role}. Solo administradores pueden crear obras.`
            : ""
        }
      />
    </main>
  );
};

export default ObraNueva;
