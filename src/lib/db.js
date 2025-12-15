import mysql from 'mysql2/promise';

const db = await mysql.createPool({
  host: process.env.DB_HOST,       // e.g. 'localhost'
  user: process.env.DB_USER,       // e.g. 'root'
  password: process.env.DB_PASS,   // your DB password
  database: process.env.DB_NAME,   // e.g. 'camrilla_expenses'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
