import express from "express";

import pool from "../db.js";
import ensureCuentasTable from "../db/ensureCuentasTable.js";
import requireAuth, { requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

const TIPOS = ["efectivo", "bancaria_personal", "bancaria_empresarial"];

const resolveOwnerId = async (user) => {
  if (user.role === "admin") {
    return user.id;
  }

  // TODO: reemplazar por relación explícita obra -> admin cuando exista.
  const [rows] = await pool.query(
    "SELECT id FROM usuarios WHERE role = 'admin' AND equipo_id = ? ORDER BY id ASC LIMIT 1",
    [user.equipo_id]
  );

  return rows[0]?.id ?? null;
};

const buildFilters = (query) => {
  const filters = [];
  const values = [];

  if (query.activa === "1" || query.activa === "0") {
    filters.push("activa = ?");
    values.push(Number(query.activa));
  }

  if (query.tipo) {
    if (!TIPOS.includes(query.tipo)) {
      return { error: "Tipo inválido." };
    }
    filters.push("tipo = ?");
    values.push(query.tipo);
  }

  if (query.q) {
    filters.push("nombre LIKE ?");
    values.push(`%${query.q.trim()}%`);
  }

  return { filters, values };
};

router.get("/", requireAuth, async (req, res, next) => {
  try {
    await ensureCuentasTable();
    const ownerId = await resolveOwnerId(req.user);
    if (!ownerId) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "No se encontró un administrador para listar cuentas.",
        errors: null,
      });
    }

    const { filters, values, error } = buildFilters(req.query);
    if (error) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: error,
        errors: { tipo: "TIPO_INVALIDO" },
      });
    }

    const where = ["created_by = ?"];
    const params = [ownerId];
    if (filters?.length) {
      where.push(...filters);
      params.push(...values);
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, descripcion, tipo, saldo, activa, created_by, created_at, updated_at FROM cuentas WHERE ${where.join(
        " AND "
      )} ORDER BY created_at DESC`,
      params
    );

    return res.status(200).json({
      ok: true,
      data: rows,
      message: null,
      errors: null,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    await ensureCuentasTable();
    const { nombre, descripcion, tipo, activa } = req.body || {};
    const trimmedNombre = String(nombre || "").trim();

    if (!trimmedNombre || trimmedNombre.length < 2 || trimmedNombre.length > 120) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "El nombre es obligatorio y debe tener entre 2 y 120 caracteres.",
        errors: { nombre: "INVALID" },
      });
    }

    if (!tipo || !TIPOS.includes(tipo)) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "El tipo es obligatorio y debe ser válido.",
        errors: { tipo: "INVALID" },
      });
    }

    const isActive = activa === undefined ? 1 : Number(Boolean(activa));

    const [existing] = await pool.query(
      "SELECT id FROM cuentas WHERE created_by = ? AND nombre = ? LIMIT 1",
      [req.user.id, trimmedNombre]
    );

    if (existing.length) {
      return res.status(409).json({
        ok: false,
        data: null,
        message: "Ya existe una cuenta con ese nombre.",
        errors: { nombre: "DUPLICATE" },
      });
    }

    const [result] = await pool.query(
      "INSERT INTO cuentas (nombre, descripcion, tipo, activa, created_by) VALUES (?, ?, ?, ?, ?)",
      [
        trimmedNombre,
        descripcion ? String(descripcion).trim() : null,
        tipo,
        isActive,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, nombre, descripcion, tipo, saldo, activa, created_by, created_at, updated_at FROM cuentas WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      data: rows[0],
      message: "Cuenta creada correctamente.",
      errors: null,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
