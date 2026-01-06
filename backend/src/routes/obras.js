const express = require('express');
const pool = require('../db');

const router = express.Router();

function validateObra(payload) {
  const errors = [];
  const requiredFields = [
    'nombre_proyecto',
    'clave',
    'direccion',
    'ubicacion',
    'clientes',
    'responsable_obra',
    'fecha_inicio',
    'porcentaje_honorarios',
    'estado',
  ];

  requiredFields.forEach((field) => {
    if (!payload[field]) {
      errors.push(`${field} es requerido`);
    }
  });

  if (payload.clave && !/^[A-Za-z0-9]{3}$/.test(payload.clave)) {
    errors.push('clave debe tener exactamente 3 caracteres alfanuméricos');
  }

  if (payload.porcentaje_honorarios && Number.isNaN(Number(payload.porcentaje_honorarios))) {
    errors.push('porcentaje_honorarios debe ser un número');
  }

  if (payload.estado && !['activa', 'archivada'].includes(payload.estado)) {
    errors.push('estado debe ser activa o archivada');
  }

  return errors;
}

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const errors = validateObra(payload);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO obras
        (usuario_id, nombre_proyecto, clave, direccion, ubicacion, clientes, responsable_obra, fecha_inicio, porcentaje_honorarios, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        req.user.id,
        payload.nombre_proyecto,
        payload.clave,
        payload.direccion,
        payload.ubicacion,
        payload.clientes,
        payload.responsable_obra,
        payload.fecha_inicio,
        payload.porcentaje_honorarios,
        payload.estado,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM obras WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear obra' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM obras WHERE usuario_id = ? ORDER BY created_at DESC, id DESC',
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar obras' });
  }
});

module.exports = router;
