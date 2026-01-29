import Button from "./Button.jsx";
import Card from "./Card.jsx";
import Input from "./Input.jsx";
import { STATUS_OPTIONS } from "../utils/obras.js";

const ObraForm = ({
  form,
  validation,
  onChange,
  onSubmit,
  loading,
  error,
  submitLabel,
  disabled,
  notice,
}) => (
  <Card>
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="nombre"
          name="nombre"
          label="Nombre"
          value={form.nombre}
          onChange={onChange}
          placeholder="Obra Paseo Norte"
          required
          error={validation.nombre}
        />
        <Input
          id="clave"
          name="clave"
          label="Clave"
          value={form.clave}
          onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text shadow-sm"
          >
            {STATUS_OPTIONS.map((option) => (
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
          onChange={onChange}
        />
        <Input
          id="portada_url"
          name="portada_url"
          label="Portada URL"
          value={form.portada_url}
          onChange={onChange}
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
            onChange={onChange}
          />
          <Input
            id="direccion_ciudad"
            name="direccion_ciudad"
            label="Ciudad"
            value={form.direccion_ciudad}
            onChange={onChange}
          />
          <Input
            id="direccion_colonia"
            name="direccion_colonia"
            label="Colonia"
            value={form.direccion_colonia}
            onChange={onChange}
          />
          <Input
            id="direccion_calle"
            name="direccion_calle"
            label="Calle"
            value={form.direccion_calle}
            onChange={onChange}
          />
          <Input
            id="direccion_numero"
            name="direccion_numero"
            label="No."
            value={form.direccion_numero}
            onChange={onChange}
          />
          <Input
            id="direccion_cp"
            name="direccion_cp"
            label="CP"
            value={form.direccion_cp}
            onChange={onChange}
          />
        </div>
      </div>

      {notice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <Button type="submit" isLoading={loading} disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  </Card>
);

export default ObraForm;
