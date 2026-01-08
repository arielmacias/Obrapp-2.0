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

export default router;
