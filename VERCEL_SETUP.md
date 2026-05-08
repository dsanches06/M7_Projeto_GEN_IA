# Guia de Setup no Vercel + Neon

## 1️⃣ Criar Banco de Dados no Neon

1. Acesse https://console.neon.tech
2. Clique em **"New Project"**
3. Digite o nome (ex: "clickup-taskbot")
4. Selecione a região (escolha próxima ao seu usuário)
5. Clique em **"Create Project"**
6. Na página do projeto, vá em **"Connection"**
7. Copie a **"Connection pooler"** URL (importante para serverless):
   ```
   postgresql://neondb_owner:abc123xyz@ep-random-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## 2️⃣ Conectar Repositório no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Procure por seu repositório e clique em **"Import"**

## 3️⃣ Configurar Variáveis de Ambiente

1. No painel do projeto Vercel, vá em **"Settings"**
2. Clique em **"Environment Variables"**
3. Adicione as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Cole a Connection Pooler do Neon |
| `CLIENT_URL` | https://seu-app.vercel.app |
| `GEMINI_API_KEY` | Sua chave da Google API |
| `MODEL_NAME` | gemini-1-5-flash (ou outro modelo) |

4. Clique em **"Save"**

## 4️⃣ Deploy Automático

1. O Vercel vai detectar o `vercel.json`
2. Clique em **"Deploy"**
3. O build vai:
   - ✅ Instalar dependências (frontend + backend)
   - ✅ Fazer build do frontend
   - ✅ Executar `npm run init-db` (inicializar Neon)
   - ✅ Deploy automático

## 5️⃣ Monitorar o Build

1. Clique em "Deployments"
2. Acompanhe o progresso
3. Procure pelo log do `init-db`:
   ```
   🚀 Iniciando inicialização do banco Neon...
   DATABASE_URL configurada: ✅
   ✅ Conectado ao Neon com sucesso!
   📄 Preparando para executar schema...
   ✅ Schema executado!
   ✅ Seed executado!
   🎉 Banco de dados inicializado com sucesso!
   ```

## ✅ Verificar Deploy

1. Acesse o URL do seu projeto (ex: https://seu-app.vercel.app)
2. Teste as APIs:
   ```bash
   curl https://seu-app.vercel.app/api/projects
   ```

## 🔧 Troubleshooting

### Erro: "DATABASE_URL is undefined"
- ❌ Variável não foi configurada no Vercel
- ✅ Solução: Adicione em Settings → Environment Variables

### Erro: "ECONNREFUSED"
- ❌ Banco de dados não foi inicializado
- ✅ Solução: Redeploy (ou reexecute `npm run init-db` localmente)

### Erro: "SSL connection refused"
- ❌ Neon requer SSL
- ✅ Solução: Verificar se DATABASE_URL termina com `?sslmode=require`

### Build falha no `init-db`
1. Verifique se DATABASE_URL está correto
2. Teste localmente: `DATABASE_URL=... npm run init-db`
3. Verifique permissões no Neon

## 🔄 Redeploy ou Reimplementação do DB

### Reimplementar o schema (limpar tudo)
```bash
# Local
npm --prefix backend run init-db

# Via Vercel CLI
vercel env pull
npm --prefix backend run init-db
```

### Redeployar tudo
```bash
git push origin main
# Vercel fará build automático
```

## 📊 Monitorar Aplicação

### Logs do Vercel
1. Vá em "Deployments"
2. Clique no deployment
3. Veja os logs em "Logs"

### Banco de Dados (Neon)
1. Acesse https://console.neon.tech
2. Veja as queries e conexões ativas
3. Monitore resource usage

## 🎯 Próximos Passos

1. ✅ Setup concluído
2. 🧪 Teste as APIs
3. 🔐 Configure autenticação (se necessário)
4. 📈 Monitore performance

## 📝 Referências

- [Documentação Neon](https://neon.tech/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Vercel + PostgreSQL](https://vercel.com/docs/storage/postgres)
