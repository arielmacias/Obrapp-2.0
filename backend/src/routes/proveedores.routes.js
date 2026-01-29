import express from "express";

import pool from "../db.js";
import ensureGastosTables from "../db/ensureGastosTables.js";
import requireAuth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    await ensureGastosTables();
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.status(200).json({ ok: true, data: [] });
    }
    const [rows] = await pool.query(
      "SELECT id, nombre FROM proveedores WHERE nombre LIKE ? ORDER BY nombre ASC LIMIT 10",
      [`%${query}%`]
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
