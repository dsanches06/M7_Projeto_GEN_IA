const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL não está configurada!");
  console.warn("   Para Vercel: Settings → Environment Variables → Adiciona DATABASE_URL");
  console.warn("   Para desenvolvimento local: Cria .env com DATABASE_URL=postgresql://...");
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Flag to track if DB has been initialized
let dbInitialized = false;

// Initialize the database table
async function initDB() {
  if (dbInitialized) return;
  
  // If DATABASE_URL is not set, skip initialization
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  Pulando inicialização do DB (DATABASE_URL não configurada)");
    return;
  }
  
  try {
    // Test connection first
    await pool.query("SELECT NOW();");
    console.log("✅ Conectado ao PostgreSQL");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        "createdAt" TEXT NOT NULL
      );
    `);
    console.log("✅ Tabela 'transactions' inicializada");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon_name TEXT,
        color TEXT
      );
    `);
    console.log("✅ Tabela 'categories' inicializada");

    // Migrate data from JSON if table is empty
    await migrateData();
    dbInitialized = true;
  } catch (error) {
    console.error("❌ Erro ao inicializar DB:", error.message);
    throw error;
  }
}

// Migrate data from transactions.json to PostgreSQL (one-time operation)
async function migrateData() {
  try {
    // Migrate transactions
    const txResult = await pool.query("SELECT COUNT(*) FROM transactions;");
    const txCount = parseInt(txResult.rows[0].count, 10);

    if (txCount === 0) {
      const jsonPath = path.join(__dirname, "transactions.json");
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        
        for (const transaction of data.transactions || []) {
          await pool.query(
            `INSERT INTO transactions 
             (id, description, amount, category, type, date, "createdAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING;`,
            [
              transaction.id,
              transaction.description,
              transaction.amount,
              transaction.category,
              transaction.type,
              transaction.date,
              transaction.createdAt,
            ]
          );
        }
        console.log(`📦 ${data.transactions.length} transações migradas para PostgreSQL`);
      }
    }

    // Migrate categories
    const catResult = await pool.query("SELECT COUNT(*) FROM categories;");
    const catCount = parseInt(catResult.rows[0].count, 10);

    if (catCount === 0) {
      const categories = require("./categories");
      for (const cat of categories) {
        await pool.query(
          `INSERT INTO categories (slug, name, icon_name, color) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (slug) DO NOTHING;`,
          [cat.slug, cat.label, cat.slug, cat.color]
        );
      }
      console.log(`📦 ${categories.length} categorias migradas para PostgreSQL`);
    }
  } catch (error) {
    console.error("⚠️  Erro ao migrar dados:", error.message);
  }
}

// Helper to convert transaction amounts from string to number
function normalizeTransaction(transaction) {
  return {
    ...transaction,
    amount: parseFloat(transaction.amount) || 0,
  };
}

// --- Transactions ---

async function getAllTransactions() {
  // Ensure DB is initialized
  await initDB();
  
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY date DESC;");
    return result.rows.map(normalizeTransaction);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
}

async function getTransactionById(id) {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE id = $1;", [id]);
    return result.rows[0] ? normalizeTransaction(result.rows[0]) : null;
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return null;
  }
}

async function createTransaction(transaction) {
  try {
    const result = await pool.query(
      `INSERT INTO transactions 
       (id, description, amount, category, type, date, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        transaction.id,
        transaction.description,
        transaction.amount,
        transaction.category,
        transaction.type,
        transaction.date,
        transaction.createdAt,
      ]
    );
    return normalizeTransaction(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    throw error;
  }
}

async function updateTransaction(id, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`"${key}" = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    values.push(id);

    const query = `UPDATE transactions SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *;`;
    const result = await pool.query(query, values);
    return result.rows[0] ? normalizeTransaction(result.rows[0]) : null;
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    throw error;
  }
}

async function deleteTransaction(id) {
  try {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1;", [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    throw error;
  }
}

// --- Categories ---

async function getAllCategories() {
  await initDB();
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name;");
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

async function getCategoryBySlug(slug) {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE slug = $1;", [slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return null;
  }
}

module.exports = {
  initDB,
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllCategories,
  getCategoryBySlug,
  pool, // Export pool for direct queries if needed
};
