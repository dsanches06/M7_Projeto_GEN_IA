# M7_Projeto_GEN_IA

Projeto

## Projeto: TaskBot Inteligente

Criar um assistente que gere o workflow do utilizador via Linguagem Natural

## Deploy no Vercel

### Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub/GitLab

### Configuração do Banco de Dados

Para produção, você precisará configurar um banco MySQL na nuvem (ex: PlanetScale, Railway, ou AWS RDS).

### Passos para Deploy

1. **Conecte seu repositório** no Vercel
2. **Configure as variáveis de ambiente** na aba "Environment Variables":
   ```
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_mysql_database
   DB_PORT=3306
   CLIENT_URL=https://your-app.vercel.app
   MODEL_NAME=gemini-3-flash-preview
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. **Deploy automático** será feito a cada push na branch main

### Estrutura do Deploy

- **Frontend (clickUp)**: Build estático servido na raiz
- **Backend**: API servida em `/api/*`
- **Banco**: MySQL externo (não incluído no deploy)

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

