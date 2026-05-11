import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega .env.local primeiro (desenvolvimento local), depois .env (produção/fallback)
// dotenv.config não sobrescreve variáveis já definidas por padrão
dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

// FORCE_MYSQL=true em .env.local → usa MySQL local
// DATABASE_URL definido → usa PostgreSQL (Neon/Vercel)
const forceMySQL = process.env.FORCE_MYSQL === "true";
const isPostgres  = !!process.env.DATABASE_URL && !forceMySQL;

// ============================================================
// CONVERSOR MySQL → PostgreSQL  (usado apenas no branch PG)
// Converte queries com ? para $1, $2...
// e adapta SET ?, LIKE, INSERT para sintaxe PostgreSQL
// ============================================================
function mysqlToPg(sql, params = []) {
  const values = [];
  let paramIndex = 1;
  const queue = Array.from(params);

  const sqlWithParams = sql.replace(/\?/g, () => {
    if (queue.length === 0) {
      values.push(undefined);
      return `$${paramIndex++}`;
    }

    const param = queue.shift();

    if (param === undefined || param === null) {
      values.push(param);
      return `$${paramIndex++}`;
    }

    if (Array.isArray(param)) {
      if (param.length === 0) {
        values.push(null);
        return "(NULL)";
      }
      const placeholders = param.map(() => `$${paramIndex++}`).join(", ");
      values.push(...param);
      return placeholders;
    }

    if (
      typeof param === "object" &&
      !(param instanceof Date) &&
      !(param instanceof Buffer)
    ) {
      const keys = Object.keys(param);
      if (keys.length === 0) {
        values.push(undefined);
        return `$${paramIndex++}`;
      }
      const assignments = keys.map((key) => {
        values.push(param[key]);
        return `${key} = $${paramIndex++}`;
      });
      return assignments.join(", ");
    }

    values.push(param);
    return `$${paramIndex++}`;
  });

  // LIKE → ILIKE (case-insensitive no PostgreSQL)
  const finalSql = sqlWithParams.replace(/\bLIKE\b/g, "ILIKE");

  return { s: finalSql, p: values };
}

// ============================================================
// INICIALIZAÇÃO DO POOL
// ============================================================
let _query;

if (isPostgres) {
  // ── PostgreSQL (Neon / Vercel) ──────────────────────────────
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
      return [
        rows,
        {
          insertId,
          affectedRows: res.rowCount ?? 0,
          rowCount:     res.rowCount ?? 0,
        },
      ];
    } catch (err) {
      console.error("[PG] Error:", err.message, "\nSQL:", sql);
      throw err;
    }
  };
} else {
  // ── MySQL (local) ───────────────────────────────────────────
  console.log("🐬 DB: MySQL (local)");
  console.log(
    `   Host: ${process.env.DB_HOST || "localhost"} | DB: ${process.env.DB_NAME || "clickup_db"}`
  );

  const mysql = await import("mysql2/promise");

  const pool = mysql.createPool({
    host:               process.env.DB_HOST     || "localhost",
    user:               process.env.DB_USER     || "root",
    password:           process.env.DB_PASSWORD || "",
    database:           process.env.DB_NAME     || "clickup_db",
    port:               parseInt(process.env.DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  });

  // Remove cláusula RETURNING (sintaxe PostgreSQL não suportada pelo MySQL)
  const stripReturning = (sql) =>
    sql.replace(/\s+RETURNING\s+\w+(\s*,\s*\w+)*/gi, "").trim();

  _query = async (sql, params = []) => {
    const mysqlSql = stripReturning(sql);
    try {
      const [rows] = await pool.query(mysqlSql, params);
      return [
        rows,
        {
          insertId:     rows?.insertId     ?? null,
          affectedRows: rows?.affectedRows ?? 0,
          rowCount:     rows?.affectedRows ?? 0,
        },
      ];
    } catch (err) {
      console.error("[MySQL] Error:", err.message, "\nSQL:", mysqlSql);
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
    console.log("✅ DB connection OK");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    throw err;
  }
}
