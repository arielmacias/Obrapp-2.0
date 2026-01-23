import { useCallback, useEffect, useMemo, useState } from "react";

import { createCuentaRequest, fetchCuentasRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const tipoOptions = [
  { value: "", label: "Todos los tipos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "bancaria_personal", label: "Bancaria personal" },
  { value: "bancaria_empresarial", label: "Bancaria empresarial" },
];

const tipoLabels = {
  efectivo: "Efectivo",
  bancaria_personal: "Bancaria personal",
  bancaria_empresarial: "Bancaria empresarial",
};

const Cuentas = () => {
  const { user } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    activa: true,
    q: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    activa: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const canCreate = user?.role === "admin";

  const loadCuentas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        tipo: filters.tipo || undefined,
        activa: filters.activa ? "1" : undefined,
        q: filters.q.trim() || undefined,
      };
      const { data } = await fetchCuentasRequest(params);
      setCuentas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.activa, filters.q, filters.tipo]);

  useEffect(() => {
    loadCuentas();
  }, [loadCuentas]);

  const validation = useMemo(() => {
    const errors = {};
    if (!form.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    }
    if (!form.tipo) {
      errors.tipo = "Selecciona un tipo";
    }
    return errors;
  }, [form.nombre, form.tipo]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!canCreate) {
      setFormError("Solo los administradores pueden crear cuentas.");
      return;
    }
    if (Object.keys(validation).length) {
      setFormError("Revisa los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        tipo: form.tipo,
        activa: form.activa,
      };
      const { data } = await createCuentaRequest(payload);
      setCuentas((prev) => [data, ...prev]);
      setForm({ nombre: "", descripcion: "", tipo: "", activa: true });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Cuentas</h1>
          <p className="text-sm text-muted">
            Catálogo mínimo de cuentas para seleccionar en gastos.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Cerrar" : "+ Nueva cuenta"}
          </Button>
        ) : null}
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-[200px_200px_1fr] md:items-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="tipo" className="text-sm font-medium text-text">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text shadow-sm"
            >
              {tipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="q"
            name="q"
            label="Buscar por nombre"
            value={filters.q}
            onChange={handleFilterChange}
            placeholder="Ej. Caja chica"
          />
          <label className="flex items-center gap-3 text-sm text-text">
            <input
              type="checkbox"
              name="activa"
              checked={filters.activa}
              onChange={handleFilterChange}
              className="h-4 w-4 accent-accent"
            />
            Solo activas
          </label>
        </div>
      </Card>

      {showForm ? (
        <Card>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                id="nombre"
                name="nombre"
                label="Nombre"
                value={form.nombre}
                onChange={handleFormChange}
                placeholder="Cuenta principal"
                required
                error={validation.nombre}
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="tipoCuenta" className="text-sm font-medium text-text">
                  Tipo
                </label>
                <select
                  id="tipoCuenta"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleFormChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text shadow-sm"
                >
                  <option value="">Selecciona un tipo</option>
                  {tipoOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {validation.tipo ? (
                  <p className="text-xs text-red-500">{validation.tipo}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="descripcion" className="text-sm font-medium text-text">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  placeholder="Opcional"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text shadow-sm"
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-text">
                <input
                  type="checkbox"
                  name="activa"
                  checked={form.activa}
                  onChange={handleFormChange}
                  className="h-4 w-4 accent-accent"
                />
                Activa
              </label>
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            ) : null}

            <Button type="submit" isLoading={saving} disabled={!canCreate}>
              Crear cuenta
            </Button>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-muted">Cargando cuentas…</p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}

      {!loading && !error && !cuentas.length ? (
        <Card>
          <p className="text-sm text-muted">Aún no hay cuentas registradas.</p>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {cuentas.map((cuenta) => (
          <Card key={cuenta.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text">{cuenta.nombre}</h3>
                <p className="text-xs text-muted">
                  {tipoLabels[cuenta.tipo] || cuenta.tipo}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  cuenta.activa ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {cuenta.activa ? "Activa" : "Inactiva"}
              </span>
            </div>
            {cuenta.descripcion ? (
              <p className="mt-3 text-sm text-muted">{cuenta.descripcion}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Cuentas;
