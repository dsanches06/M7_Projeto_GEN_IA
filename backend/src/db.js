import dotenv from "dotenv";
dotenv.config();

/**
 * db.js — Adaptador dual MySQL (local) / PostgreSQL (Vercel/Neon)
 *
 * DATABASE_URL definida → PostgreSQL (Neon/Vercel)
 * Caso contrário        → MySQL2 (local: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
 *
 * Interface: db.query(sql, params) → [rows, result]
 *   rows.insertId       — ID inserido (emulado no PG via RETURNING id)
 *   result.affectedRows — linhas afetadas
 */

const isPostgres = !!process.env.DATABASE_URL;

function mysqlToPg(sql, params) {
  let s = sql.trim();
  let p = Array.isArray(params) ? [...params] : [];

  // UPDATE table SET ? WHERE ...  (primeiro param é objeto plain)
  const setRe = /\bSET\s+\?/i;
  if (setRe.test(s) && p.length > 0 && p[0] !== null && typeof p[0] === "object" && !Array.isArray(p[0])) {
    const obj = p[0], keys = Object.keys(obj), vals = keys.map(k => obj[k]);
    const clause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    s = s.replace(setRe, `SET ${clause}`);
    const rest = p.slice(1); let ri = 0;
    s = s.replace(/\?/g, () => `$${keys.length + (++ri)}`);
    p = [...vals, ...rest];
  } else {
    let idx = 1;
    s = s.replace(/\?/g, () => `$${idx++}`);
  }

  // LIKE → ILIKE
  s = s.replace(/\bLIKE\b/g, "ILIKE");

  // INSERT sem RETURNING → adiciona RETURNING id
  if (/^\s*INSERT\s+/i.test(s) && !/\bRETURNING\b/i.test(s)) {
    s = s.trimEnd().replace(/;$/, "") + " RETURNING id";
  }

  return { s, p };
}

let _query;

if (isPostgres) {
  const { default: pgPkg } = await import("pg");
  const pool = new pgPkg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  _query = async (sql, params = []) => {
    const { s, p } = mysqlToPg(sql, params);
    try {
      const res = await pool.query(s, p);
      const insertId = res.rows?.[0]?.id ?? null;
      const rows = Object.assign(Array.from(res.rows ?? []), { insertId, affectedRows: res.rowCount ?? 0 });
      return [rows, { insertId, affectedRows: res.rowCount ?? 0, rowCount: res.rowCount ?? 0 }];
    } catch (err) {
      console.error("[PG] Query error:", err.message);
      console.error("[PG] Converted SQL:", s);
      throw err;
    }
  };
  console.log("🐘 DB: PostgreSQL (Neon)");
} else {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "clickup_db",
    port:     parseInt(process.env.DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
  });
  _query = async (sql, params = []) => {
    try {
      const [rows] = await pool.query(sql, params);
      return [rows, { insertId: rows?.insertId ?? null, affectedRows: rows?.affectedRows ?? 0, rowCount: rows?.affectedRows ?? 0 }];
    } catch (err) {
      console.error("[MySQL] Query error:", err.message);
      throw err;
    }
  };
  console.log("🐬 DB: MySQL (local)");
}

export const db = { query: _query };

export async function initDB() {
  try { await _query("SELECT 1"); console.log("✅ DB connection OK"); }
  catch (err) { console.error("❌ DB connection failed:", err.message); throw err; }
}
