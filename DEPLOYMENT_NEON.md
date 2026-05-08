# Deployment no Vercel com Neon PostgreSQL

## Visão Geral

Este projeto foi migrado de MySQL para PostgreSQL usando **Neon** como banco de dados hospedado.

## Configuração para Deploy

### 1. Variáveis de Ambiente

No Vercel, configure a seguinte variável de ambiente:

```
DATABASE_URL=postgresql://[usuario]:[senha]@[host]/[database]?sslmode=require
```

Obtenha a CONNECTION STRING do painel Neon:
- Acesse https://console.neon.tech
- Selecione seu projeto
- Clique em "Connection String"
- Copie a URL do tipo "Connection pooler" (recomendado para serverless)

### 2. Deploy Automático

O arquivo `vercel.json` já está configurado para:

1. **Instalar dependências** - tanto do frontend (clickUp) quanto do backend
2. **Build do Frontend** - executa `npm run build` no diretório clickUp
3. **Inicializar Banco de Dados** - executa `npm run init-db` no backend
   - Cria o schema PostgreSQL completo
   - Insere dados de seed inicial
   - Ajusta as sequências das IDs

### 3. Fluxo de Build

```bash
# 1. Instala deps clickUp
npm --prefix clickUp install

# 2. Instala deps backend  
npm --prefix backend install

# 3. Constrói o frontend
npm --prefix clickUp run build

# 4. Inicializa o banco de dados
npm --prefix backend run init-db
```

## Estrutura do Projeto

### Frontend (clickUp)
- Framework: Vite + React
- Output: `clickUp/dist`
- Build: `npm run build`

### Backend (Express + Node.js)
- Runtime: Node.js 18.x
- Database: PostgreSQL (Neon)
- Main: `backend/src/server.js`
- Init Script: `backend/init-neon-db.js`

## Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `vercel.json` | Configuração do Vercel |
| `.vercelignore` | Arquivos ignorados no build |
| `backend/init-neon-db.js` | Script de inicialização do banco |
| `backend/database-init-postgres.sql` | Schema PostgreSQL |
| `backend/database-seed-postgres.sql` | Dados iniciais |
| `backend/src/db.js` | Configuração da conexão PostgreSQL |

## Variáveis de Conexão

O `backend/src/db.js` lê a variável `DATABASE_URL` e cria um pool de conexões com:
- SSL rejectUnauthorized: false (para Neon)
- Suporte a connection pooling

## Troubleshooting

### Erro: "role postgres does not exist"
- Este erro foi corrigido removendo GRANT para o usuário postgres
- O script agora apenas faz GRANT ALL para public

### Erro: "column id referenced does not exist"
- Ocorria quando tabelas com dependências era criadas antes de suas referências
- Corrigido criando tabelas sem dependências primeiro

### Erro: "DATABASE_URL não configurada"
- Certifique-se de que a variável está definida no Vercel Project Settings
- Verify no dashboard: Settings > Environment Variables

## Reexecução da Inicialização

Para reexecutar a inicialização do banco sem rebuild completo:

```bash
# Local
npm --prefix backend run init-db

# Via Vercel CLI
vercel env pull
npm --prefix backend run init-db
```

## Próximas Etapas

1. Configure `DATABASE_URL` no Vercel
2. Faça push para o repositório
3. Vercel fará build automático
4. O schema será criado no Neon automaticamente
5. A aplicação estará pronta para usar!

## Observações

- O `vercel.json` ignora source files do backend via `.vercelignore`
- Apenas os arquivos necessários são enviados para Vercel
- O frontend é servido estaticamente de `clickUp/dist`
- O backend é executado como função Node.js serverless
