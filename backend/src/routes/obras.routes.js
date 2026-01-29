import express from "express";

import pool from "../db.js";
import requireAuth, { requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

const STATUS_VALUES = ["ACTIVA", "PAUSADA", "CERRADA"];
const CLAVE_REGEX = /^[A-Z0-9]{3}$/;

const normalizePayload = (payload) => {
  const cleaned = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
};

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, equipo_id, created_by, nombre, clave, cliente_nombre, status, fecha_inicio, direccion_estado, direccion_ciudad, direccion_colonia, direccion_calle, direccion_numero, direccion_cp, lat, lng, portada_url, created_at FROM obras WHERE equipo_id = ? ORDER BY created_at DESC",
      [req.user.equipo_id]
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const {
      nombre,
      clave,
      cliente_nombre,
      status,
      fecha_inicio,
      direccion_estado,
      direccion_ciudad,
      direccion_colonia,
      direccion_calle,
      direccion_numero,
      direccion_cp,
      lat,
      lng,
      portada_url,
    } = req.body || {};

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const claveNormalizada = String(clave || "").trim().toUpperCase();
    if (!CLAVE_REGEX.test(claveNormalizada)) {
      return res
        .status(400)
        .json({ error: "La clave debe tener 3 caracteres alfanuméricos en mayúsculas" });
    }

    if (status && !STATUS_VALUES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const payload = normalizePayload({
      equipo_id: req.user.equipo_id,
      created_by: req.user.id,
      nombre: String(nombre).trim(),
      clave: claveNormalizada,
      cliente_nombre: cliente_nombre ? String(cliente_nombre).trim() : null,
      status: status || "ACTIVA",
      fecha_inicio: fecha_inicio || null,
      direccion_estado: direccion_estado || null,
      direccion_ciudad: direccion_ciudad || null,
      direccion_colonia: direccion_colonia || null,
      direccion_calle: direccion_calle || null,
      direccion_numero: direccion_numero || null,
      direccion_cp: direccion_cp || null,
      lat: lat ?? null,
      lng: lng ?? null,
      portada_url: portada_url || null,
    });

    const columns = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = columns.map(() => "?").join(", ");

    const [result] = await pool.query(
      `INSERT INTO obras (${columns.join(", ")}) VALUES (${placeholders})`,
      values
    );

    const [rows] = await pool.query(
      "SELECT id, equipo_id, created_by, nombre, clave, cliente_nombre, status, fecha_inicio, direccion_estado, direccion_ciudad, direccion_colonia, direccion_calle, direccion_numero, direccion_cp, lat, lng, portada_url, created_at FROM obras WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "La clave ya existe para este equipo" });
    }
    return next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);
    if (!Number.isInteger(obraId)) {
      return res.status(400).json({ error: "Id inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, equipo_id, created_by, nombre, clave, cliente_nombre, status, fecha_inicio, direccion_estado, direccion_ciudad, direccion_colonia, direccion_calle, direccion_numero, direccion_cp, lat, lng, portada_url, created_at FROM obras WHERE id = ?",
      [obraId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    if (rows[0].equipo_id !== req.user.equipo_id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);
    if (!Number.isInteger(obraId)) {
      return res.status(400).json({ error: "Id inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, equipo_id, created_by FROM obras WHERE id = ?",
      [obraId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    if (
      rows[0].equipo_id !== req.user.equipo_id ||
      rows[0].created_by !== req.user.id
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const {
      nombre,
      clave,
      cliente_nombre,
      status,
      fecha_inicio,
      direccion_estado,
      direccion_ciudad,
      direccion_colonia,
      direccion_calle,
      direccion_numero,
      direccion_cp,
      lat,
      lng,
      portada_url,
    } = req.body || {};

    if (nombre !== undefined && !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (clave !== undefined) {
      const claveNormalizada = String(clave || "").trim().toUpperCase();
      if (!CLAVE_REGEX.test(claveNormalizada)) {
        return res
          .status(400)
          .json({ error: "La clave debe tener 3 caracteres alfanuméricos en mayúsculas" });
      }
    }

    if (status && !STATUS_VALUES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const payload = normalizePayload({
      nombre: nombre !== undefined ? String(nombre).trim() : undefined,
      clave: clave !== undefined ? String(clave).trim().toUpperCase() : undefined,
      cliente_nombre: cliente_nombre !== undefined ? String(cliente_nombre).trim() : undefined,
      status: status !== undefined ? status : undefined,
      fecha_inicio: fecha_inicio !== undefined ? fecha_inicio || null : undefined,
      direccion_estado: direccion_estado !== undefined ? direccion_estado || null : undefined,
      direccion_ciudad: direccion_ciudad !== undefined ? direccion_ciudad || null : undefined,
      direccion_colonia: direccion_colonia !== undefined ? direccion_colonia || null : undefined,
      direccion_calle: direccion_calle !== undefined ? direccion_calle || null : undefined,
      direccion_numero: direccion_numero !== undefined ? direccion_numero || null : undefined,
      direccion_cp: direccion_cp !== undefined ? direccion_cp || null : undefined,
      lat: lat !== undefined ? lat ?? null : undefined,
      lng: lng !== undefined ? lng ?? null : undefined,
      portada_url: portada_url !== undefined ? portada_url || null : undefined,
    });

    if (!Object.keys(payload).length) {
      return res.status(400).json({ error: "No hay cambios para actualizar" });
    }

    const columns = Object.keys(payload);
    const values = Object.values(payload);
    const setClause = columns.map((column) => `${column} = ?`).join(", ");

    await pool.query(`UPDATE obras SET ${setClause} WHERE id = ?`, [...values, obraId]);

    const [updatedRows] = await pool.query(
      "SELECT id, equipo_id, created_by, nombre, clave, cliente_nombre, status, fecha_inicio, direccion_estado, direccion_ciudad, direccion_colonia, direccion_calle, direccion_numero, direccion_cp, lat, lng, portada_url, created_at FROM obras WHERE id = ?",
      [obraId]
    );

    return res.status(200).json({ data: updatedRows[0] });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "La clave ya existe para este equipo" });
    }
    return next(error);
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const obraId = Number(req.params.id);
    if (!Number.isInteger(obraId)) {
      return res.status(400).json({ error: "Id inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, equipo_id, created_by FROM obras WHERE id = ?",
      [obraId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }

    if (
      rows[0].equipo_id !== req.user.equipo_id ||
      rows[0].created_by !== req.user.id
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await pool.query("DELETE FROM obras WHERE id = ?", [obraId]);

    return res.status(200).json({ data: { id: obraId } });
  } catch (error) {
    return next(error);
  }
});

export default router;
