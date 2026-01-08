import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

import pool from "../db.js";
import requireAuth from "../middleware/auth.middleware.js";

const router = express.Router();
let ensureRoleColumnPromise;

const ensureRoleColumn = async () => {
  if (!ensureRoleColumnPromise) {
    ensureRoleColumnPromise = (async () => {
      const [[{ count }]] = await pool.query(
        "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'role'"
      );

      if (Number(count) === 0) {
        try {
          await pool.query(
            "ALTER TABLE usuarios ADD COLUMN role ENUM('admin','resid') NOT NULL DEFAULT 'resid' AFTER password_hash"
          );
        } catch (error) {
          if (error?.code !== "ER_DUP_FIELDNAME") {
            throw error;
          }
        }
      }
    })();
  }

  await ensureRoleColumnPromise;
};

router.post("/login", async (req, res, next) => {
  try {
    await ensureRoleColumn();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email y password son requeridos" });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash, role, equipo_id, activo FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length || rows[0].activo !== 1) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];
    const storedHash = user.password_hash?.startsWith("$2y$")
      ? `$2b${user.password_hash.slice(3)}`
      : user.password_hash;
    const match = await bcrypt.compare(password, storedHash);

    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, equipo_id: user.equipo_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        equipo_id: user.equipo_id,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    await ensureRoleColumn();
    const [rows] = await pool.query(
      "SELECT id, nombre, email, role, equipo_id, activo FROM usuarios WHERE id = ? LIMIT 1",
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
        role: user.role,
        equipo_id: user.equipo_id,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
