# Migração para Neon (PostgreSQL) no Vercel

## 📋 Passos para Migração

### 1. Criar Banco no Neon
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a `DATABASE_URL` (postgresql://...)

### 2. Configurar Variáveis no Vercel
No painel do Vercel, vá para:
- **Settings** → **Environment Variables**
- Adicione: `DATABASE_URL` = `postgresql://...`
- Adicione: `GEMINI_API_KEY` = `your_key`
- **IMPORTANTE**: Remova as variáveis MySQL antigas se existirem

### 3. Executar Scripts SQL no Neon
Você pode executar os scripts de duas formas:

#### Opção A: Via Script Node.js (Recomendado)
```bash
# No diretório backend
cd backend

# Configure DATABASE_URL no .env
echo "DATABASE_URL=postgresql://..." > .env

# Execute o script de inicialização
npm run init-db
```

#### Opção B: Via Neon Dashboard
1. Abra o Neon Dashboard
2. Vá para **SQL Editor**
3. Execute primeiro: `database-init-postgres.sql`
4. Depois: `database-seed-postgres.sql`

### 4. Deploy no Vercel
```bash
# Commit das mudanças
git add .
git commit -m "feat: migrate to Neon PostgreSQL"

# Push para Vercel
git push
```

## 📁 Arquivos Criados/Modificados

- `backend/package.json`: `mysql2` → `pg`
- `backend/src/db.js`: Adaptado para PostgreSQL
- `backend/.env.example`: Atualizado para `DATABASE_URL`
- `backend/database-init-postgres.sql`: Schema PostgreSQL
- `backend/database-seed-postgres.sql`: Dados padrão
- `backend/init-neon-db.js`: Script de inicialização

## 🔧 Desenvolvimento Local

```bash
# Backend
cd backend
npm install
# Configure .env com DATABASE_URL
npm run dev

# Frontend
cd ../clickUp
npm install
npm run dev
```

## ⚠️ Notas Importantes

- **Queries MySQL**: Alguns queries podem precisar ajustes para PostgreSQL
- **Datas**: PostgreSQL usa formato diferente para datas
- **AUTO_INCREMENT**: Substituído por `SERIAL` no PostgreSQL
- **LIMIT**: Sintaxe pode variar em alguns casos

## 🐛 Debugging

Se houver erros de query, verifique:
1. Logs do Vercel (Function Logs)
2. Conexão com Neon (testar `DATABASE_URL`)
3. Queries específicas que podem precisar ajuste