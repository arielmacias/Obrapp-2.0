import pool from "../db.js";

export async function ensureSchema() {
  await pool.query(
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role ENUM('admin','resid') NOT NULL DEFAULT 'resid' AFTER password_hash"
  );
}
