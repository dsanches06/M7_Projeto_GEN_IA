import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada. Defina a variável de ambiente DATABASE_URL antes de executar este script.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function hasColumn(table, column) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return result.rowCount > 0;
}

async function getForeignKeyConstraints(table, column) {
  const result = await pool.query(
    `SELECT tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = $1
      AND kcu.column_name = $2
      AND tc.constraint_type = 'FOREIGN KEY'`,
    [table, column]
  );
  return result.rows.map(row => row.constraint_name);
}

async function runMigration() {
  console.log('🚀 Iniciando migração do Neon para summaries com conversation_id...');

  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexão com o banco Neon estabelecida.');

    const table = 'summaries';
    const oldColumn = 'project_id';
    const newColumn = 'conversation_id';

    if (await hasColumn(table, oldColumn)) {
      const oldConstraints = await getForeignKeyConstraints(table, oldColumn);
      for (const constraint of oldConstraints) {
        console.log(`🔧 Removendo constraint antiga ${constraint}...`);
        await pool.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraint}`);
      }

      console.log(`🔧 Removendo coluna antiga ${oldColumn}...`);
      await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${oldColumn}`);
    } else {
      console.log(`ℹ️ Coluna antiga ${oldColumn} não existe ou já foi removida.`);
    }

    if (!(await hasColumn(table, newColumn))) {
      console.log(`➕ Adicionando coluna ${newColumn}...`);
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${newColumn} INT`);
    } else {
      console.log(`ℹ️ Coluna ${newColumn} já existe.`);
    }

    const fkConstraints = await getForeignKeyConstraints(table, newColumn);
    if (fkConstraints.length === 0) {
      console.log(`➕ Adicionando foreign key para ${newColumn}...`);
      await pool.query(`ALTER TABLE ${table} ADD CONSTRAINT fk_summaries_conversation FOREIGN KEY (${newColumn}) REFERENCES conversations(id) ON DELETE CASCADE`);
    } else {
      console.log(`ℹ️ Foreign key para ${newColumn} já existe.`);
    }

    console.log('🎉 Migração de schema concluída com sucesso.');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com o banco encerrada.');
  }
}

if (process.argv[1] === __filename) {
  runMigration();
}

export { runMigration };
