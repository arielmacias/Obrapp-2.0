const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_ROOT_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} = process.env;

const resolvedConfig = {
  host: DB_HOST || MYSQL_HOST || 'localhost',
  user: DB_USER || MYSQL_USER || 'root',
  password: DB_PASSWORD ?? MYSQL_PASSWORD ?? MYSQL_ROOT_PASSWORD ?? '',
  database: DB_NAME || MYSQL_DATABASE || 'obrapp',
  port: Number(DB_PORT || MYSQL_PORT || 3306)
};

const pool = mysql.createPool({
  ...resolvedConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
