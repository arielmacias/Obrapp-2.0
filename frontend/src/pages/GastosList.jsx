import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteGastoRequest,
  downloadComprobanteRequest,
  fetchCuentasRequest,
  fetchGastosRequest,
  fetchObrasRequest,
} from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PARTIDA_OPTIONS, TIPO_OPTIONS, formatCurrency } from "../utils/gastos.js";

const pagoOptions = [
  { value: "", label: "Todos" },
  { value: "POR_PAGAR", label: "Por pagar" },
  { value: "PAGADO", label: "Pagado" },
];

const isInCurrentWeek = (dateValue) => {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const gastoDate = new Date(`${dateValue}T00:00:00`);
  return gastoDate >= start && gastoDate <= end;
};

const GastosList = () => {
  const { user } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [obras, setObras] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [filters, setFilters] = useState({
    obra_id: "",
    cuenta_id: "",
    tipo: "",
    partida: "",
    pago_status: "",
    fecha_from: "",
    fecha_to: "",
    search: "",
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const isAdmin = user?.role === "admin";

  const loadCatalogs = useCallback(async () => {
    const [obrasResponse, cuentasResponse] = await Promise.all([
      fetchObrasRequest(),
      fetchCuentasRequest(),
    ]);
    setObras(obrasResponse.data || []);
    setCuentas(cuentasResponse.data || []);
  }, []);

  const loadGastos = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const { data, meta: metaResponse } = await fetchGastosRequest({
          ...filters,
          page,
          limit: meta.limit,
        });
        setGastos(data || []);
        setMeta((prev) => ({
          ...prev,
          page: metaResponse?.page ?? page,
          total: metaResponse?.total ?? 0,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters, meta.limit]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadGastos(1);
  }, [loadGastos]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(meta.total / meta.limit));
  }, [meta.limit, meta.total]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadGastos(1);
  };

  const handleDownload = async (gasto) => {
    setActionError("");
    try {
      const blob = await downloadComprobanteRequest(gasto.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comprobante-${gasto.id}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (gasto) => {
    setActionError("");
    if (!window.confirm("¿Deseas eliminar este gasto?")) {
      return;
    }
    try {
      await deleteGastoRequest(gasto.id);
      await loadGastos(meta.page);
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Gastos</h1>
          <p className="text-sm text-muted">
            Registro ágil de gastos con impacto contable y control por rol.
          </p>
        </div>
        <Link to="/gastos/nuevo">
          <Button>+ Nuevo gasto</Button>
        </Link>
      </div>

      <Card>
        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="obra_id" className="text-sm font-medium text-text">
              Obra
            </label>
            <select
              id="obra_id"
              name="obra_id"
              value={filters.obra_id}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">Todas las obras</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cuenta_id" className="text-sm font-medium text-text">
              Cuenta
            </label>
            <select
              id="cuenta_id"
              name="cuenta_id"
              value={filters.cuenta_id}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">Todas las cuentas</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tipo" className="text-sm font-medium text-text">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">Todos</option>
              {TIPO_OPTIONS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
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
              value={filters.partida}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">Todas</option>
              {PARTIDA_OPTIONS.map((partida) => (
                <option key={partida} value={partida}>
                  {partida}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="pago_status" className="text-sm font-medium text-text">
              Pago
            </label>
            <select
              id="pago_status"
              name="pago_status"
              value={filters.pago_status}
              onChange={handleFilterChange}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm"
            >
              {pagoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="search"
            name="search"
            label="Buscar"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Concepto o proveedor"
          />
          <Input
            id="fecha_from"
            name="fecha_from"
            type="date"
            label="Desde"
            value={filters.fecha_from}
            onChange={handleFilterChange}
          />
          <Input
            id="fecha_to"
            name="fecha_to"
            type="date"
            label="Hasta"
            value={filters.fecha_to}
            onChange={handleFilterChange}
          />
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Aplicar filtros
            </Button>
          </div>
        </form>
      </Card>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {actionError ? <p className="text-sm text-red-500">{actionError}</p> : null}

      <Card>
        {loading ? (
          <p className="text-sm text-muted">Cargando gastos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Obra</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Partida</th>
                  <th className="py-2">Concepto</th>
                  <th className="py-2">Proveedor</th>
                  <th className="py-2">Importe</th>
                  <th className="py-2">Pago</th>
                  <th className="py-2">Cuenta</th>
                  <th className="py-2">Comprobante</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => {
                  const canEdit =
                    isAdmin || (gasto.fecha && isInCurrentWeek(gasto.fecha));
                  return (
                    <tr key={gasto.id} className="border-t border-border">
                      <td className="py-3">{gasto.fecha}</td>
                      <td className="py-3">{gasto.obra_nombre}</td>
                      <td className="py-3">{gasto.tipo}</td>
                      <td className="py-3">{gasto.partida}</td>
                      <td className="py-3">{gasto.concepto}</td>
                      <td className="py-3">{gasto.proveedor_nombre || "-"}</td>
                      <td className="py-3">{formatCurrency(gasto.importe)}</td>
                      <td className="py-3">
                        {gasto.pago_status === "PAGADO" ? "Pagado" : "Por pagar"}
                      </td>
                      <td className="py-3">{gasto.cuenta_nombre}</td>
                      <td className="py-3">
                        {gasto.comprobante_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(gasto)}
                            className="text-xs font-semibold text-accent"
                          >
                            Descargar
                          </button>
                        ) : (
                          "Pendiente"
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/gastos/${gasto.id}`}
                            className="text-xs font-semibold text-muted hover:text-text"
                          >
                            Ver
                          </Link>
                          {canEdit ? (
                            <>
                              <Link
                                to={`/gastos/${gasto.id}/editar`}
                                className="text-xs font-semibold text-muted hover:text-text"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(gasto)}
                                className="text-xs font-semibold text-red-500"
                              >
                                Borrar
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted">Solo semana actual</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Página {meta.page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={meta.page <= 1}
            onClick={() => loadGastos(meta.page - 1)}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={meta.page >= totalPages}
            onClick={() => loadGastos(meta.page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </main>
  );
};

export default GastosList;
