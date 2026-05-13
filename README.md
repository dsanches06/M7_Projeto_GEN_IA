# M7_Projeto_GEN_IA

Projeto

## Projeto: TaskBot Inteligente

Criar um assistente que gere o workflow do utilizador via Linguagem Natural

## Deploy no Vercel

### Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub/GitLab

### Configuração do Banco de Dados

Este projeto foi migrado para **Neon PostgreSQL** para melhor compatibilidade com Vercel.

#### Database: Neon (PostgreSQL)
- **Tipo**: PostgreSQL gerenciado na nuvem
- **Ideal para**: Serverless, Vercel, aplicações modernas
- **Vantagem**: Scaling automático, backups inclusos

Para migração completa, veja [DEPLOYMENT_NEON.md](DEPLOYMENT_NEON.md).

### Passos para Deploy

1. **Crie um projeto no Neon**:
   - Acesse https://console.neon.tech
   - Crie um novo projeto
   - Copie a CONNECTION STRING do tipo "Connection pooler"

2. **Conecte seu repositório** no Vercel

3. **Configure as variáveis de ambiente** na aba "Environment Variables":
   ```
   DATABASE_URL=postgresql://neondb_owner:password@host/database
   CLIENT_URL=https://your-app.vercel.app
   MODEL_NAME=gemini_model
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Deploy automático** será feito a cada push na branch main
   - O `init-db` será executado automaticamente
   - Schema e dados iniciais serão criados no Neon

### Estrutura do Deploy

- **Frontend (clickUp)**: Build estático (Vite) servido na raiz
- **Backend**: API Express em `/api/*`
- **Banco**: Neon PostgreSQL (inicializado automaticamente)

### Desenvolvimento Local

#### Backend

1. Entre em `backend`
2. Instale as dependências: `npm install`
3. Preencha um arquivo `backend/.env` baseado em `backend/.env.example`
4. Execute em produção: `npm start`
5. Em desenvolvimento: `npm run dev`

#### Frontend

1. Entre em `clickUp`
2. Instale as dependências: `npm install`
3. Gere a build de produção: `npm run build`
4. Sirva os arquivos em `dist/` com um host estático ou deploy em Vercel/Netlify

### Heroku / Render (opcional)

- Para deploy em Heroku, o projeto usa `Procfile` no root:
  - `web: node backend/src/app.js`
- Certifique-se de configurar as variáveis de ambiente no serviço de hospedagem.

