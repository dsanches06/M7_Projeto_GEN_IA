import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL não está configurada!");
  console.warn("   Para Vercel: Settings → Environment Variables → Adiciona DATABASE_URL");
  console.warn("   Para desenvolvimento local: Cria .env com DATABASE_URL=postgresql://...");
}

// PostgreSQL connection pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Flag to track if DB has been initialized
let dbInitialized = false;

// Initialize the database schema (optional - you can run SQL files manually)
async function initDB() {
  if (dbInitialized) return;

  // If DATABASE_URL is not set, skip initialization
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  Pulando inicialização do DB (DATABASE_URL não configurada)");
    return;
  }

  try {
    // Test connection first
    await db.query("SELECT NOW();");
    console.log("✅ Conectado ao PostgreSQL (Neon)");

    // Optional: Run schema creation here if needed
    // await createSchema();

    dbInitialized = true;
  } catch (error) {
    console.error("❌ Erro ao inicializar DB:", error.message);
    throw error;
  }
}

// Optional: Create schema programmatically (or use SQL files)
async function createSchema() {
  // You can implement schema creation here if preferred over SQL files
  console.log("📋 Schema creation via code (implement if needed)");
}

// Helper function to convert MySQL-style queries to PostgreSQL
// This is a basic adapter - you may need to adjust queries
export const query = async (sql, params = []) => {
  try {
    const result = await db.query(sql, params);
    return [result.rows, result]; // Mimic mysql2 format [rows, result]
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Export init function
export { initDB };
