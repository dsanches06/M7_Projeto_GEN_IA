import { initDatabase } from './init-neon-db.js';
import { runMigration } from './migrate-summaries.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

async function runFullMigration() {
  console.log('🚀 Iniciando migração completa do Neon...');

  try {
    console.log('📄 Etapa 1: Inicializando banco de dados...');
    await initDatabase();

    console.log('📄 Etapa 2: Aplicando migração de summaries...');
    await runMigration();

    console.log('🎉 Migração completa do Neon concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração completa:', error.message);
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  runFullMigration();
}

export { runFullMigration };