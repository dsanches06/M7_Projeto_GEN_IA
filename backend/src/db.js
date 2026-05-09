import dotenv from "dotenv";
dotenv.config();

// ============================================================
// DETEÇÃO AUTOMÁTICA DE BASE DE DADOS
// - Se DATABASE_URL existir → PostgreSQL (Neon / Vercel)
// - Se não existir          → MySQL (local)
// ============================================================
const isPostgres = !!process.env.DATABASE_URL;

// ============================================================
// CONVERSOR MySQL → PostgreSQL
// Converte queries com ? para $1, $2...
// e adapta SET ?, LIKE, INSERT para sintaxe PostgreSQL
// ============================================================
function mysqlToPg(sql, params) {
  let s = sql.trim();
  let p = Array.isArray(params) ? [...params] : [];

  // Trata SET ? com objeto (UPDATE)
  const setRe = /\bSET\s+\?/i;
  if (
    setRe.test(s) &&
    p.length > 0 &&
    p[0] !== null &&
    typeof p[0] === "object" &&
    !Array.isArray(p[0])
  ) {
    const obj = p[0];
    const keys = Object.keys(obj);
    const vals = keys.map((k) => obj[k]);
    const clause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    s = s.replace(setRe, `SET ${clause}`);
    const rest = p.slice(1);
    let ri = 0;
    s = s.replace(/\?/g, () => `$${keys.length + ++ri}`);
    p = [...vals, ...rest];
  } else {
    // Substitui ? por $1, $2, $3...
    let idx = 1;
    s = s.replace(/\?/g, () => `$${idx++}`);
  }

  // LIKE → ILIKE (case-insensitive no PostgreSQL)
  s = s.replace(/\bLIKE\b/g, "ILIKE");

  // INSERT sem RETURNING → adiciona RETURNING id
  if (/^\s*INSERT\s+/i.test(s) && !/\bRETURNING\b/i.test(s)) {
    s = s.trimEnd().replace(/;$/, "") + " RETURNING id";
  }

  return { s, p };
}

// ============================================================
// INICIALIZAÇÃO DO POOL
// ============================================================
let _query;

if (isPostgres) {
  // ── PostgreSQL (Neon) ─────────────────────────────────────
  console.log("🐘 DB: PostgreSQL (Neon)");

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
      const rows = Object.assign(Array.from(res.rows ?? []), {
        insertId,
        affectedRows: res.rowCount ?? 0,
      });
      return [rows, { insertId, affectedRows: res.rowCount ?? 0, rowCount: res.rowCount ?? 0 }];
    } catch (err) {
      console.error("[PG] Error:", err.message, "\nSQL:", sql);
      throw err;
    }
  };
} else {
  // ── MySQL (local) ─────────────────────────────────────────
  console.log("🐬 DB: MySQL (local)");

  const mysql = await import("mysql2/promise");

  const pool = mysql.createPool({
    host:            process.env.DB_HOST     || "localhost",
    user:            process.env.DB_USER     || "root",
    password:        process.env.DB_PASSWORD || "",
    database:        process.env.DB_NAME     || "clickup_db",
    port:            parseInt(process.env.DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
  });

  _query = async (sql, params = []) => {
    try {
      const [rows] = await pool.query(sql, params);
      return [
        rows,
        {
          insertId:     rows?.insertId     ?? null,
          affectedRows: rows?.affectedRows ?? 0,
          rowCount:     rows?.affectedRows ?? 0,
        },
      ];
    } catch (err) {
      console.error("[MySQL] Error:", err.message, "\nSQL:", sql);
      throw err;
    }
  };
}

// ============================================================
// EXPORTS
// ============================================================
export const db = { query: _query };

export async function initDB() {
  try {
    await _query("SELECT 1");
    console.log("✅ DB OK");
  } catch (err) {
    console.error("❌ DB failed:", err.message);
    throw err;
  }
}
