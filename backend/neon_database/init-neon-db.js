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

async function runSQLFile(fileName) {
  // Tenta encontrar o arquivo em múltiplos caminhos possíveis no ambiente Vercel
  const pathsToTry = [
    join(__dirname, fileName),                                     // Caminho relativo ao script atual
    join(process.cwd(), 'backend', 'neon_database', fileName),     // Caminho padrão Vercel se executado na raiz
    join(process.cwd(), 'neon_database', fileName),               // Caso a raiz do build já seja a pasta backend
    join(process.cwd(), 'backend', fileName),                      // Fallback pasta antiga
    join(process.cwd(), fileName)                                  // Fallback raiz absoluta do build
  ];

  let sql = null;
  let finalPath = '';

  for (const p of pathsToTry) {
    try {
      sql = readFileSync(p, 'utf8');
      finalPath = p;
      break; // Encontrou o arquivo com sucesso
    } catch (e) {
      // Continua tentando os próximos caminhos
    }
  }

  if (!sql) {
    console.error(`❌ Erro: Não foi possível localizar o arquivo ${fileName} em nenhum dos caminhos testados.`);
    console.error('Caminhos testados:', pathsToTry);
    throw new Error(`ENOENT: no such file or directory, open '${fileName}'`);
  }

  try {
    console.log(`📄 Executando arquivo encontrado em: ${finalPath}...`);
    await pool.query(sql);
    console.log(`✅ ${fileName} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar queries do arquivo ${fileName}:`, error.message);
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
    await runSQLFile('database-init-postgres.sql');
    console.log('✅ Schema atualizado!');

    console.log('📄 Preparando para executar seed...');
    await runSQLFile('database-seed-postgres.sql');
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

// Executa o script se chamado diretamente ou no ambiente Vercel
const currentFilePath = fileURLToPath(import.meta.url);
const isDirectRun = process.argv && process.argv.some(arg => currentFilePath.includes(arg) || arg.endsWith('init-neon-db.js'));

if (isDirectRun || process.env.VERCEL) {
  initDatabase();
}

export { initDatabase };
