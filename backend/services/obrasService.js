const pool = require('../db/pool');

const listObras = async () => {
  const [rows] = await pool.query(
    `SELECT id, nombre, clave, direccion, ubicacion, cliente, responsable, fecha_inicio,
            honorarios_porcentaje, estado, created_at
     FROM obras
     ORDER BY created_at DESC`
  );
  return rows;
};

const getObraById = async (obraId) => {
  const [[obra]] = await pool.query(
    `SELECT id, nombre, clave, direccion, ubicacion, cliente, responsable, fecha_inicio,
            honorarios_porcentaje, estado, created_at
     FROM obras
     WHERE id = ?`,
    [obraId]
  );

  if (!obra) {
    const error = new Error('Obra no encontrada');
    error.status = 404;
    throw error;
  }

  return obra;
};

const createObra = async (payload) => {
  const {
    nombre,
    clave,
    direccion,
    ubicacion,
    cliente,
    responsable,
    fecha_inicio,
    honorarios_porcentaje,
    estado
  } = payload;

  const [result] = await pool.query(
    `INSERT INTO obras
      (nombre, clave, direccion, ubicacion, cliente, responsable, fecha_inicio, honorarios_porcentaje, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      clave || null,
      direccion || null,
      ubicacion || null,
      cliente || null,
      responsable || null,
      fecha_inicio || null,
      honorarios_porcentaje ?? 0,
      estado || 'activa'
    ]
  );

  return getObraById(result.insertId);
};

const updateObra = async (obraId, payload) => {
  const fields = {
    nombre: payload.nombre,
    clave: payload.clave,
    direccion: payload.direccion,
    ubicacion: payload.ubicacion,
    cliente: payload.cliente,
    responsable: payload.responsable,
    fecha_inicio: payload.fecha_inicio,
    honorarios_porcentaje: payload.honorarios_porcentaje,
    estado: payload.estado
  };

  const updates = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (updates.length === 0) {
    return getObraById(obraId);
  }

  const setClause = updates.map(([key]) => `${key} = ?`).join(', ');
  const values = updates.map(([, value]) => value);

  await pool.query(`UPDATE obras SET ${setClause} WHERE id = ?`, [...values, obraId]);

  return getObraById(obraId);
};

const archiveObra = async (obraId) => {
  await pool.query('UPDATE obras SET estado = ? WHERE id = ?', ['archivada', obraId]);
  return getObraById(obraId);
};

module.exports = {
  listObras,
  getObraById,
  createObra,
  updateObra,
  archiveObra
};
