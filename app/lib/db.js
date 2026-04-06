// app/lib/db.js
// MySQL database connection using mysql2
// Run: npm install mysql2

import mysql from "mysql2/promise";

// Connection pool — reuses connections efficiently
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "realestate_db",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

export default pool;
