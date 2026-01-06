const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  if (process.env.AUTO_DB_SETUP === 'false') {
    return;
  }

  const dbName = process.env.DB_NAME || 'obrapp';
  const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
  let schema = await fs.readFile(schemaPath, 'utf8');

  schema = schema
    .replace(/CREATE DATABASE IF NOT EXISTS obrapp;/i, `CREATE DATABASE IF NOT EXISTS ${dbName};`)
    .replace(/USE obrapp;/i, `USE ${dbName};`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await connection.query(schema);
  await connection.end();
  console.log(`Database initialized: ${dbName}`);
}

module.exports = { initializeDatabase };
