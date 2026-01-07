import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

import pool from "../db.js";
import requireAuth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email y password son requeridos" });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length || rows[0].activo !== 1) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!rows.length || rows[0].activo !== 1) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
