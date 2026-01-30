import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchCuentasRequest,
  fetchGastoRequest,
  fetchObrasRequest,
  fetchProveedoresRequest,
  updateGastoRequest,
} from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { PARTIDA_OPTIONS, TIPO_OPTIONS } from "../utils/gastos.js";

const GastoEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [obrasResponse, cuentasResponse, gastoResponse] = await Promise.all([
        fetchObrasRequest(),
        fetchCuentasRequest(),
        fetchGastoRequest(id),
      ]);
      setObras(obrasResponse.data || []);
      setCuentas(cuentasResponse.data || []);
      const gasto = gastoResponse.data;
      setForm({
        obra_id: gasto.obra_id || "",
        fecha: gasto.fecha || "",
        tipo: gasto.tipo || "MO",
        partida: gasto.partida || PARTIDA_OPTIONS[0],
        concepto: gasto.concepto || "",
        proveedor: gasto.proveedor_nombre || "",
        referencia_comprobante: gasto.referencia_comprobante || "",
        importe: gasto.importe || "",
        iva_aplica: Boolean(gasto.iva_aplica),
        pago_status: gasto.pago_status || "POR_PAGAR",
        cuenta_id: gasto.cuenta_id || "",
        comprobante_pendiente: Boolean(gasto.comprobante_pendiente),
        comprobante_actual: Boolean(gasto.comprobante_path),
        comprobante: null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!form?.proveedor?.trim()) {
      setProveedores([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await fetchProveedoresRequest(form.proveedor.trim());
        setProveedores(data || []);
      } catch (err) {
        setProveedores([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form?.proveedor]);

  const validation = useMemo(() => {
    if (!form) {
      return {};
    }
    const errors = {};
    if (!form.obra_id) {
      errors.obra_id = "Selecciona una obra.";
    }
    if (!form.cuenta_id) {
      errors.cuenta_id = "Selecciona una cuenta.";
    }
    if (!form.fecha) {
      errors.fecha = "La fecha es obligatoria.";
    }
    if (!form.concepto.trim()) {
      errors.concepto = "El concepto es obligatorio.";
    }
    if (!form.importe || Number(form.importe) <= 0) {
      errors.importe = "El importe debe ser mayor a 0.";
    }
    if (form.referencia_comprobante && !/^[a-zA-Z0-9]{1,10}$/.test(form.referencia_comprobante)) {
      errors.referencia_comprobante = "Máximo 10 caracteres alfanuméricos.";
    }
    if (!form.comprobante_pendiente && !form.comprobante && !form.comprobante_actual) {
      errors.comprobante = "Adjunta comprobante o marca pendiente.";
    }
    return errors;
  }, [form]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "comprobante_pendiente" && checked
        ? { comprobante: null, comprobante_actual: false }
        : {}),
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({
      ...prev,
      comprobante: file,
      comprobante_pendiente: file ? false : prev.comprobante_pendiente,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form) {
      return;
    }
    setError("");
    if (Object.keys(validation).length) {
      setError("Revisa los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        obra_id: form.obra_id,
        cuenta_id: form.cuenta_id,
        fecha: form.fecha,
        tipo: form.tipo,
        partida: form.partida,
        concepto: form.concepto.trim(),
        proveedor: form.proveedor.trim(),
        referencia_comprobante: form.referencia_comprobante.trim(),
        importe: Number(form.importe).toFixed(2),
        iva_aplica: form.iva_aplica,
        pago_status: form.pago_status,
        comprobante_pendiente: form.comprobante_pendiente,
      };
      const file = form.comprobante && !form.comprobante_pendiente ? form.comprobante : null;
      await updateGastoRequest(id, payload, file);
      navigate(`/gastos/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-text">Editar gasto</h1>
        <p className="text-sm text-muted">Actualiza el gasto y su comprobante.</p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Card>
        {loading || !form ? (
          <p className="text-sm text-muted">Cargando gasto...</p>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="obra_id" className="text-sm font-medium text-text">
                  Obra
                </label>
                <select
                  id="obra_id"
                  name="obra_id"
                  value={form.obra_id}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                >
                  <option value="">Selecciona una obra</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nombre}
                    </option>
                  ))}
                </select>
                {validation.obra_id ? (
                  <p className="text-xs text-red-500">{validation.obra_id}</p>
                ) : null}
              </div>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                label="Fecha"
                value={form.fecha}
                onChange={handleChange}
                required
                error={validation.fecha}
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="pago_status" className="text-sm font-medium text-text">
                  Pago
                </label>
                <select
                  id="pago_status"
                  name="pago_status"
                  value={form.pago_status}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                >
                  <option value="POR_PAGAR">Por pagar</option>
                  <option value="PAGADO">Pagado</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cuenta_id" className="text-sm font-medium text-text">
                  Cuenta
                </label>
                <select
                  id="cuenta_id"
                  name="cuenta_id"
                  value={form.cuenta_id}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre}
                    </option>
                  ))}
                </select>
                {validation.cuenta_id ? (
                  <p className="text-xs text-red-500">{validation.cuenta_id}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="tipo" className="text-sm font-medium text-text">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                >
                  {TIPO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="partida" className="text-sm font-medium text-text">
                  Partida
                </label>
                <select
                  id="partida"
                  name="partida"
                  value={form.partida}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                >
                  {PARTIDA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                id="concepto"
                name="concepto"
                label="Concepto"
                value={form.concepto}
                onChange={handleChange}
                placeholder="Material de construcción"
                required
                error={validation.concepto}
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="proveedor" className="text-sm font-medium text-text">
                  Proveedor
                </label>
                <input
                  id="proveedor"
                  name="proveedor"
                  value={form.proveedor}
                  onChange={handleChange}
                  list="proveedores"
                  placeholder="Escribe para autocompletar"
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                />
                <datalist id="proveedores">
                  {proveedores.map((proveedorItem) => (
                    <option key={proveedorItem.id} value={proveedorItem.nombre} />
                  ))}
                </datalist>
              </div>
              <Input
                id="importe"
                name="importe"
                type="number"
                label="Importe (MXN)"
                value={form.importe}
                onChange={handleChange}
                placeholder="0.00"
                error={validation.importe}
                required
              />
              <label className="flex items-center gap-3 text-sm text-text">
                <input
                  type="checkbox"
                  name="iva_aplica"
                  checked={form.iva_aplica}
                  onChange={handleChange}
                  className="h-4 w-4 accent-accent"
                />
                IVA aplica
              </label>
              <Input
                id="referencia_comprobante"
                name="referencia_comprobante"
                label="Referencia comprobante"
                value={form.referencia_comprobante}
                onChange={handleChange}
                placeholder="ABC123"
                error={validation.referencia_comprobante}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text">Comprobante (PDF/JPG)</label>
              <input
                type="file"
                accept="application/pdf,image/jpeg"
                onChange={handleFileChange}
                className="text-sm text-muted"
              />
              {form.comprobante_actual ? (
                <p className="text-xs text-muted">Ya hay un comprobante cargado.</p>
              ) : null}
              {validation.comprobante ? (
                <p className="text-xs text-red-500">{validation.comprobante}</p>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  name="comprobante_pendiente"
                  checked={form.comprobante_pendiente}
                  onChange={handleChange}
                  className="h-4 w-4 accent-accent"
                />
                Subir después
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(`/gastos/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={saving}>
                Guardar cambios
              </Button>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
};

export default GastoEditar;
