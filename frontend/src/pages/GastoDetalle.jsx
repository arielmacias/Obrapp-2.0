import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { downloadComprobanteRequest, fetchGastoRequest } from "../api/api.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { formatCurrency } from "../utils/gastos.js";

const GastoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGasto = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchGastoRequest(id);
      setGasto(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGasto();
  }, [loadGasto]);

  const handleDownload = async () => {
    if (!gasto) {
      return;
    }
    setError("");
    try {
      const blob = await downloadComprobanteRequest(gasto.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comprobante-${gasto.id}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Detalle de gasto</h1>
          <p className="text-sm text-muted">Consulta el impacto y el comprobante.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/gastos")}>
            Volver
          </Button>
          <Link to={`/gastos/${id}/editar`}>
            <Button>Editar</Button>
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Card>
        {loading || !gasto ? (
          <p className="text-sm text-muted">Cargando gasto...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted">Obra</p>
              <p className="text-sm font-semibold text-text">{gasto.obra_nombre}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Fecha</p>
              <p className="text-sm font-semibold text-text">{gasto.fecha}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Tipo</p>
              <p className="text-sm font-semibold text-text">{gasto.tipo}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Partida</p>
              <p className="text-sm font-semibold text-text">{gasto.partida}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Concepto</p>
              <p className="text-sm font-semibold text-text">{gasto.concepto}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Proveedor</p>
              <p className="text-sm font-semibold text-text">
                {gasto.proveedor_nombre || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Importe</p>
              <p className="text-sm font-semibold text-text">
                {formatCurrency(gasto.importe)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">IVA aplica</p>
              <p className="text-sm font-semibold text-text">
                {gasto.iva_aplica ? "Sí" : "No"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Pago</p>
              <p className="text-sm font-semibold text-text">
                {gasto.pago_status === "PAGADO" ? "Pagado" : "Por pagar"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Cuenta</p>
              <p className="text-sm font-semibold text-text">{gasto.cuenta_nombre}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Referencia</p>
              <p className="text-sm font-semibold text-text">
                {gasto.referencia_comprobante || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Comprobante</p>
              {gasto.comprobante_path ? (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-sm font-semibold text-accent"
                >
                  Descargar comprobante
                </button>
              ) : (
                <p className="text-sm font-semibold text-text">Pendiente</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </main>
  );
};

export default GastoDetalle;
