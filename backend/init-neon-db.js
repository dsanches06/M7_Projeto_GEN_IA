import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';


const { Pool } = pkg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando inicialização do banco Neon...');
console.log('DATABASE_URL configurada:', process.env.DATABASE_URL ? '✅' : '❌');

// Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSQLFile(filePath) {
  try {
    console.log(`📄 Executando ${filePath}...`);
    const sql = readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`✅ ${filePath} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message);
    throw error;
  }
}

async function initDatabase() {
  console.log('🔍 Verificando DATABASE_URL...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    process.exit(1);
  }

  console.log('🔌 Tentando conectar ao Neon...');
  try {
    console.log('⏳ Fazendo query de teste...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao Neon com sucesso!');

    console.log('📄 Preparando para executar schema atualizado...');
    await runSQLFile(join(__dirname, 'database-init-postgres.sql'));
    console.log('✅ Schema atualizado!');

    console.log('📄 Preparando para executar seed...');
    await runSQLFile(join(__dirname, 'database-seed-postgres.sql'));
    console.log('✅ Seed executado!');

    console.log('🎉 Banco de dados atualizado com sucesso!');

  } catch (error) {
    console.error('❌ Erro na atualização:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    console.log('🔌 Fechando conexão...');
    await pool.end();
    console.log('✅ Conexão fechada');
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase();
}

export { initDatabase };