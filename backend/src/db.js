import dotenv from "dotenv";
dotenv.config();

// Allow forcing MySQL mode even with DATABASE_URL (for local development)
const forceMySQL = process.env.FORCE_MYSQL === 'true' || global.forceMySQL === true;
const isPostgres = !!process.env.DATABASE_URL && !forceMySQL;

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
        return `(NULL)`;
      }
      const placeholders = param.map(() => `$${paramIndex++}`).join(", ");
      values.push(...param);
      return placeholders;
    }

    if (typeof param === "object" && !(param instanceof Date) && !(param instanceof Buffer)) {
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

  return { s: sqlWithParams, p: values };
}

let _query;

if (isPostgres) {
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
  // Ambiente local sem DATABASE_URL — avisa e usa fallback vazio
  console.warn("⚠️  DATABASE_URL não definida. Queries vão falhar.");
  _query = async () => { throw new Error("DATABASE_URL não configurada"); };
}

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