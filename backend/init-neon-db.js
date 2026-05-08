import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSQLFile(filePath) {
  try {
    console.log(`📄 Executando ${filePath}...`);
    const sql = readFileSync(filePath, 'utf8');

    // Split SQL commands by semicolon (basic approach)
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

    for (const command of commands) {
      if (command.trim()) {
        await pool.query(command.trim());
      }
    }

    console.log(`✅ ${filePath} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message);
    throw error;
  }
}

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    process.exit(1);
  }

  try {
    console.log('🔌 Conectando ao Neon...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao Neon');

    // Execute schema first
    await runSQLFile(join(__dirname, 'database-init-postgres.sql'));

    // Then seed data
    await runSQLFile(join(__dirname, 'database-seed-postgres.sql'));

    console.log('🎉 Banco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };