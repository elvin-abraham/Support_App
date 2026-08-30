import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// A pool is used (rather than a single connection) so concurrent
// requests don't block on each other and dead connections get replaced.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "support_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
