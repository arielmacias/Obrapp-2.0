const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD,
  DB_NAME = 'obrapp',
  DB_PORT = 3306
} = process.env;

if (DB_PASSWORD === undefined) {
  throw new Error('DB_PASSWORD no está configurada. Revisa el archivo .env del backend.');
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
