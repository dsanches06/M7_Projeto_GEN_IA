import dotenv from "dotenv";
dotenv.config();

const isPostgres = !!process.env.DATABASE_URL;

function mysqlToPg(sql, params) {
  // ... (mantém a função igual)
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