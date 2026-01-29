import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

import pool from "../db.js";
import ensureGastosTables from "../db/ensureGastosTables.js";
import requireAuth from "../middleware/auth.middleware.js";

const router = express.Router();

const TIPOS = ["MO", "MAT", "CON", "IND"];
const PARTIDAS = [
  "Preliminares",
  "Cimentación",
  "Albañilería y muros",
  "Estructuras y Losas",
  "Instalaciones",
  "Aplanados",
  "Recubrimientos",
  "Pintura y Acabados",
  "Cancelería",
  "Herrería",
  "Carpintería",
  "Indirectos",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UPLOAD_DIR = path.resolve("uploads", "comprobantes");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const unique = `comprobante-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (["application/pdf", "image/jpeg"].includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Tipo de comprobante inválido. Usa PDF o JPG."));
  },
});

const resolveOwnerId = async (user) => {
  if (user.role === "admin") {
    return user.id;
  }

  const [rows] = await pool.query(
    "SELECT id FROM usuarios WHERE role = 'admin' AND equipo_id = ? ORDER BY id ASC LIMIT 1",
    [user.equipo_id]
  );

  return rows[0]?.id ?? null;
};

const normalizeImporte = (value) => {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
};

const isReferenciaValida = (value) => {
  if (!value) {
    return true;
  }
  return /^[a-zA-Z0-9]{1,10}$/.test(value);
};

const getWeekRange = (today = new Date()) => {
  const start = new Date(today);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const assertObraAccess = async (connection, obraId, equipoId) => {
  const [rows] = await connection.query(
    "SELECT id, equipo_id, nombre FROM obras WHERE id = ?",
    [obraId]
  );
  if (!rows.length) {
    return { ok: false, status: 404, message: "Obra no encontrada." };
  }
  if (rows[0].equipo_id !== equipoId) {
    return { ok: false, status: 403, message: "No autorizado para esta obra." };
  }
  return { ok: true, obra: rows[0] };
};

const assertCuentaAccess = async (connection, cuentaId, ownerId) => {
  const [rows] = await connection.query(
    "SELECT id, nombre FROM cuentas WHERE id = ? AND created_by = ?",
    [cuentaId, ownerId]
  );
  if (!rows.length) {
    return { ok: false, status: 404, message: "Cuenta no encontrada." };
  }
  return { ok: true, cuenta: rows[0] };
};

const ensureProveedorId = async (connection, nombre) => {
  if (!nombre) {
    return null;
  }
  const trimmed = String(nombre).trim();
  if (!trimmed) {
    return null;
  }
  const [result] = await connection.query(
    "INSERT INTO proveedores (nombre) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
    [trimmed]
  );
  return result.insertId;
};

const applyImpact = async (connection, gasto) => {
  if (gasto.pago_status !== "PAGADO") {
    return;
  }
  await connection.query("UPDATE cuentas SET saldo = saldo - ? WHERE id = ?", [
    gasto.importe,
    gasto.cuenta_id,
  ]);
};

const revertImpact = async (connection, gasto) => {
  if (gasto.pago_status !== "PAGADO") {
    return;
  }
  await connection.query("UPDATE cuentas SET saldo = saldo + ? WHERE id = ?", [
    gasto.importe,
    gasto.cuenta_id,
  ]);
};

const selectGastoById = async (connection, gastoId) => {
  const [rows] = await connection.query(
    `SELECT g.*, o.nombre AS obra_nombre, o.equipo_id, c.nombre AS cuenta_nombre, p.nombre AS proveedor_nombre
     FROM gastos g
     INNER JOIN obras o ON o.id = g.obra_id
     INNER JOIN cuentas c ON c.id = g.cuenta_id
     LEFT JOIN proveedores p ON p.id = g.proveedor_id
     WHERE g.id = ? AND g.deleted_at IS NULL`,
    [gastoId]
  );
  return rows[0] || null;
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return value === "1" || value === "true";
};

router.get("/", requireAuth, async (req, res, next) => {
  try {
    await ensureGastosTables();
    const filters = [];
    const values = [];

    filters.push("g.deleted_at IS NULL");
    filters.push("o.equipo_id = ?");
    values.push(req.user.equipo_id);

    if (req.query.obra_id) {
      filters.push("g.obra_id = ?");
      values.push(Number(req.query.obra_id));
    }
    if (req.query.cuenta_id) {
      filters.push("g.cuenta_id = ?");
      values.push(Number(req.query.cuenta_id));
    }
    if (req.query.tipo) {
      if (!TIPOS.includes(req.query.tipo)) {
        return res.status(400).json({ error: "Tipo inválido." });
      }
      filters.push("g.tipo = ?");
      values.push(req.query.tipo);
    }
    if (req.query.partida) {
      filters.push("g.partida = ?");
      values.push(req.query.partida);
    }
    if (req.query.pago_status) {
      if (!["POR_PAGAR", "PAGADO"].includes(req.query.pago_status)) {
        return res.status(400).json({ error: "Pago status inválido." });
      }
      filters.push("g.pago_status = ?");
      values.push(req.query.pago_status);
    }
    if (req.query.fecha_from) {
      filters.push("g.fecha >= ?");
      values.push(req.query.fecha_from);
    }
    if (req.query.fecha_to) {
      filters.push("g.fecha <= ?");
      values.push(req.query.fecha_to);
    }
    if (req.query.search) {
      filters.push("(g.concepto LIKE ? OR p.nombre LIKE ?)");
      values.push(`%${req.query.search.trim()}%`, `%${req.query.search.trim()}%`);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM gastos g
       INNER JOIN obras o ON o.id = g.obra_id
       LEFT JOIN proveedores p ON p.id = g.proveedor_id
       ${whereClause}`,
      values
    );

    const [rows] = await pool.query(
      `SELECT g.*, o.nombre AS obra_nombre, c.nombre AS cuenta_nombre, p.nombre AS proveedor_nombre
       FROM gastos g
       INNER JOIN obras o ON o.id = g.obra_id
       INNER JOIN cuentas c ON c.id = g.cuenta_id
       LEFT JOIN proveedores p ON p.id = g.proveedor_id
       ${whereClause}
       ORDER BY g.fecha DESC, g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return res.status(200).json({
      ok: true,
      data: rows,
      meta: {
        total: countRows[0]?.total ?? 0,
        page,
        limit,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    await ensureGastosTables();
    const gastoId = Number(req.params.id);
    if (!Number.isInteger(gastoId)) {
      return res.status(400).json({ error: "Id inválido." });
    }

    const gasto = await selectGastoById(pool, gastoId);
    if (!gasto) {
      return res.status(404).json({ error: "Gasto no encontrado." });
    }
    if (gasto.equipo_id && gasto.equipo_id !== req.user.equipo_id) {
      return res.status(403).json({ error: "No autorizado." });
    }

    return res.status(200).json({ ok: true, data: gasto });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, upload.single("comprobante"), async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await ensureGastosTables();

    const {
      obra_id,
      cuenta_id,
      fecha,
      tipo,
      partida,
      concepto,
      proveedor,
      referencia_comprobante,
      importe,
      iva_aplica,
      pago_status,
      comprobante_pendiente,
    } = req.body || {};

    const importeNormalizado = normalizeImporte(importe);
    if (!obra_id || !cuenta_id) {
      return res
        .status(400)
        .json({ error: "Obra y cuenta son obligatorias." });
    }
    if (!fecha) {
      return res.status(400).json({ error: "La fecha es obligatoria." });
    }
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido." });
    }
    if (!PARTIDAS.includes(partida)) {
      return res.status(400).json({ error: "Partida inválida." });
    }
    if (!concepto || !String(concepto).trim()) {
      return res.status(400).json({ error: "El concepto es obligatorio." });
    }
    if (!isReferenciaValida(referencia_comprobante)) {
      return res
        .status(400)
        .json({ error: "La referencia debe ser alfanumérica y <= 10 caracteres." });
    }
    if (!importeNormalizado || importeNormalizado <= 0) {
      return res.status(400).json({ error: "El importe debe ser mayor a 0." });
    }
    if (!["POR_PAGAR", "PAGADO"].includes(pago_status)) {
      return res.status(400).json({ error: "Pago status inválido." });
    }

    await connection.beginTransaction();

    const obraCheck = await assertObraAccess(connection, Number(obra_id), req.user.equipo_id);
    if (!obraCheck.ok) {
      await connection.rollback();
      return res.status(obraCheck.status).json({ error: obraCheck.message });
    }

    const ownerId = await resolveOwnerId(req.user);
    if (!ownerId) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "No se encontró un administrador para validar cuentas." });
    }
    const cuentaCheck = await assertCuentaAccess(connection, Number(cuenta_id), ownerId);
    if (!cuentaCheck.ok) {
      await connection.rollback();
      return res.status(cuentaCheck.status).json({ error: cuentaCheck.message });
    }

    const proveedorId = await ensureProveedorId(connection, proveedor);
    const file = req.file;
    const pendienteInput = parseBoolean(comprobante_pendiente);
    if (!file && pendienteInput === false) {
      await connection.rollback();
      return res.status(400).json({
        error: "El comprobante es obligatorio o debe quedar marcado como pendiente.",
      });
    }
    const comprobantePendiente = file ? 0 : pendienteInput === null ? 1 : Number(pendienteInput);
    const comprobantePath = file ? path.join("uploads", "comprobantes", file.filename) : null;
    const comprobanteMime = file ? file.mimetype : null;

    const [result] = await connection.query(
      `INSERT INTO gastos
        (obra_id, cuenta_id, fecha, tipo, partida, concepto, proveedor_id, referencia_comprobante,
         comprobante_path, comprobante_mime, comprobante_pendiente, importe, iva_aplica,
         pago_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(obra_id),
        Number(cuenta_id),
        fecha,
        tipo,
        partida,
        String(concepto).trim(),
        proveedorId,
        referencia_comprobante ? String(referencia_comprobante).trim() : null,
        comprobantePath,
        comprobanteMime,
        comprobantePendiente,
        importeNormalizado,
        parseBoolean(iva_aplica) ? 1 : 0,
        pago_status,
        req.user.id,
      ]
    );

    const gasto = await selectGastoById(connection, result.insertId);
    await applyImpact(connection, gasto);

    await connection.commit();

    return res.status(201).json({
      ok: true,
      data: gasto,
      message: "Gasto registrado correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

router.put("/:id", requireAuth, upload.single("comprobante"), async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await ensureGastosTables();
    const gastoId = Number(req.params.id);
    if (!Number.isInteger(gastoId)) {
      return res.status(400).json({ error: "Id inválido." });
    }

    await connection.beginTransaction();

    const gastoActual = await selectGastoById(connection, gastoId);
    if (!gastoActual) {
      await connection.rollback();
      return res.status(404).json({ error: "Gasto no encontrado." });
    }

    if (gastoActual.equipo_id && gastoActual.equipo_id !== req.user.equipo_id) {
      await connection.rollback();
      return res.status(403).json({ error: "No autorizado." });
    }

    if (req.user.role !== "admin") {
      const { start, end } = getWeekRange();
      const gastoFecha = new Date(`${gastoActual.fecha}T00:00:00`);
      if (gastoFecha < start || gastoFecha > end) {
        await connection.rollback();
        return res.status(403).json({
          error: "Solo puedes editar gastos de la semana en curso.",
        });
      }
    }

    const payload = req.body || {};
    const nextTipo = payload.tipo ?? gastoActual.tipo;
    const nextPartida = payload.partida ?? gastoActual.partida;
    const nextConcepto = payload.concepto ?? gastoActual.concepto;
    const nextFecha = payload.fecha ?? gastoActual.fecha;
    const nextPagoStatus = payload.pago_status ?? gastoActual.pago_status;
    const nextImporte = payload.importe ?? gastoActual.importe;
    const nextCuentaId = payload.cuenta_id ?? gastoActual.cuenta_id;

    const importeNormalizado = normalizeImporte(nextImporte);
    if (!TIPOS.includes(nextTipo)) {
      await connection.rollback();
      return res.status(400).json({ error: "Tipo inválido." });
    }
    if (!PARTIDAS.includes(nextPartida)) {
      await connection.rollback();
      return res.status(400).json({ error: "Partida inválida." });
    }
    if (!nextConcepto || !String(nextConcepto).trim()) {
      await connection.rollback();
      return res.status(400).json({ error: "El concepto es obligatorio." });
    }
    if (!nextFecha) {
      await connection.rollback();
      return res.status(400).json({ error: "La fecha es obligatoria." });
    }
    if (!isReferenciaValida(payload.referencia_comprobante)) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "La referencia debe ser alfanumérica y <= 10 caracteres." });
    }
    if (!importeNormalizado || importeNormalizado <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: "El importe debe ser mayor a 0." });
    }
    if (!["POR_PAGAR", "PAGADO"].includes(nextPagoStatus)) {
      await connection.rollback();
      return res.status(400).json({ error: "Pago status inválido." });
    }

    const ownerId = await resolveOwnerId(req.user);
    if (!ownerId) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "No se encontró un administrador para validar cuentas." });
    }
    const cuentaCheck = await assertCuentaAccess(connection, Number(nextCuentaId), ownerId);
    if (!cuentaCheck.ok) {
      await connection.rollback();
      return res.status(cuentaCheck.status).json({ error: cuentaCheck.message });
    }

    if (payload.obra_id && Number(payload.obra_id) !== Number(gastoActual.obra_id)) {
      const obraCheck = await assertObraAccess(
        connection,
        Number(payload.obra_id),
        req.user.equipo_id
      );
      if (!obraCheck.ok) {
        await connection.rollback();
        return res.status(obraCheck.status).json({ error: obraCheck.message });
      }
    }

    let proveedorId = gastoActual.proveedor_id;
    if (payload.proveedor !== undefined) {
      proveedorId = await ensureProveedorId(connection, payload.proveedor);
    }

    let comprobantePath = gastoActual.comprobante_path;
    let comprobanteMime = gastoActual.comprobante_mime;
    let comprobantePendiente = gastoActual.comprobante_pendiente;
    if (req.file) {
      comprobantePath = path.join("uploads", "comprobantes", req.file.filename);
      comprobanteMime = req.file.mimetype;
      comprobantePendiente = 0;
    } else if (payload.comprobante_pendiente !== undefined) {
      const pendiente = parseBoolean(payload.comprobante_pendiente);
      if (pendiente === false && !gastoActual.comprobante_path) {
        await connection.rollback();
        return res.status(400).json({
          error: "El comprobante es obligatorio o debe quedar marcado como pendiente.",
        });
      }
      if (pendiente !== null) {
        comprobantePendiente = Number(pendiente);
        if (comprobantePendiente) {
          comprobantePath = null;
          comprobanteMime = null;
        }
      }
    }

    const ivaValue =
      payload.iva_aplica === undefined
        ? gastoActual.iva_aplica
        : parseBoolean(payload.iva_aplica)
        ? 1
        : 0;
    const referenciaValue =
      payload.referencia_comprobante === undefined
        ? gastoActual.referencia_comprobante
        : payload.referencia_comprobante
        ? String(payload.referencia_comprobante).trim()
        : null;

    const updatedFields = {
      obra_id: payload.obra_id ? Number(payload.obra_id) : gastoActual.obra_id,
      cuenta_id: Number(nextCuentaId),
      fecha: nextFecha,
      tipo: nextTipo,
      partida: nextPartida,
      concepto: String(nextConcepto).trim(),
      proveedor_id: proveedorId,
      referencia_comprobante: referenciaValue,
      comprobante_path: comprobantePath,
      comprobante_mime: comprobanteMime,
      comprobante_pendiente: comprobantePendiente,
      importe: importeNormalizado,
      iva_aplica: ivaValue,
      pago_status: nextPagoStatus,
      updated_by: req.user.id,
    };

    await revertImpact(connection, gastoActual);

    await connection.query(
      `UPDATE gastos SET
        obra_id = ?,
        cuenta_id = ?,
        fecha = ?,
        tipo = ?,
        partida = ?,
        concepto = ?,
        proveedor_id = ?,
        referencia_comprobante = ?,
        comprobante_path = ?,
        comprobante_mime = ?,
        comprobante_pendiente = ?,
        importe = ?,
        iva_aplica = ?,
        pago_status = ?,
        updated_by = ?
       WHERE id = ?`,
      [
        updatedFields.obra_id,
        updatedFields.cuenta_id,
        updatedFields.fecha,
        updatedFields.tipo,
        updatedFields.partida,
        updatedFields.concepto,
        updatedFields.proveedor_id,
        updatedFields.referencia_comprobante,
        updatedFields.comprobante_path,
        updatedFields.comprobante_mime,
        updatedFields.comprobante_pendiente,
        updatedFields.importe,
        updatedFields.iva_aplica,
        updatedFields.pago_status,
        updatedFields.updated_by,
        gastoId,
      ]
    );

    const gastoActualizado = await selectGastoById(connection, gastoId);
    await applyImpact(connection, gastoActualizado);

    await connection.commit();

    return res.status(200).json({
      ok: true,
      data: gastoActualizado,
      message: "Gasto actualizado correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await ensureGastosTables();
    const gastoId = Number(req.params.id);
    if (!Number.isInteger(gastoId)) {
      return res.status(400).json({ error: "Id inválido." });
    }

    await connection.beginTransaction();

    const gastoActual = await selectGastoById(connection, gastoId);
    if (!gastoActual) {
      await connection.rollback();
      return res.status(404).json({ error: "Gasto no encontrado." });
    }

    if (gastoActual.equipo_id && gastoActual.equipo_id !== req.user.equipo_id) {
      await connection.rollback();
      return res.status(403).json({ error: "No autorizado." });
    }

    if (req.user.role !== "admin") {
      const { start, end } = getWeekRange();
      const gastoFecha = new Date(`${gastoActual.fecha}T00:00:00`);
      if (gastoFecha < start || gastoFecha > end) {
        await connection.rollback();
        return res.status(403).json({
          error: "Solo puedes borrar gastos de la semana en curso.",
        });
      }
    }

    await revertImpact(connection, gastoActual);

    await connection.query(
      "UPDATE gastos SET deleted_at = NOW(), updated_by = ? WHERE id = ?",
      [req.user.id, gastoId]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      message: "Gasto eliminado correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

router.get("/:id/comprobante", requireAuth, async (req, res, next) => {
  try {
    await ensureGastosTables();
    const gastoId = Number(req.params.id);
    if (!Number.isInteger(gastoId)) {
      return res.status(400).json({ error: "Id inválido." });
    }
    const gasto = await selectGastoById(pool, gastoId);
    if (!gasto) {
      return res.status(404).json({ error: "Gasto no encontrado." });
    }
    if (gasto.equipo_id && gasto.equipo_id !== req.user.equipo_id) {
      return res.status(403).json({ error: "No autorizado." });
    }
    if (!gasto.comprobante_path) {
      return res.status(404).json({ error: "No hay comprobante disponible." });
    }
    const filePath = path.resolve(gasto.comprobante_path);
    return res.sendFile(filePath);
  } catch (error) {
    return next(error);
  }
});

export default router;
