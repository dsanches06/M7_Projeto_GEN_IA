# 🎯 ClickUp - Task Manager com TaskBot AI

Gerenciador de tarefas inteligente com integração de Chat usando Gemini 3 Flash.

## 📋 Características

- ✅ **Dashboard Completo** - Visão geral de tarefas, projetos e estatísticas
- 💬 **Chat Inteligente (TaskBot)** - Crie tarefas usando linguagem natural
- 🎨 **Design Moderno** - UI Dark Mode com Tailwind CSS
- 📱 **Responsivo** - Funciona em desktop e mobile
- ⚡ **React + Vite** - Performance otimizada
- 🔄 **Integração API** - Conectado com backend Node.js

## 🚀 Quick Start

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua API_URL e GEMINI_API_KEY
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar em: http://localhost:5173
```

### Build

```bash
# Gerar build de produção
npm build

# Preview da build
npm run preview
```

## 📁 Estrutura de Projeto

```
src/
├── components/
│   ├── Header.jsx      # Barra de navegação superior
│   ├── Sidebar.jsx     # Menu lateral de navegação
│   ├── Dashboard.jsx   # Painel principal com tarefas
│   ├── TaskCard.jsx    # Card individual de tarefa
│   ├── Chat.jsx        # Interface do Chat TaskBot
│   └── index.js        # Exportações
├── services/
│   └── chatService.js  # Integração com API de Chat
├── context/
│   └── ThemeContext.jsx # Contexto de tema (dark mode)
├── App.jsx             # Componente raiz
├── main.jsx            # Entry point
└── index.css           # Estilos globais com Tailwind
```

## 🎯 Como Usar o TaskBot

### Exemplos de Comandos

1. **Criar Tarefa Básica**
   ```
   "Adiciona uma tarefa para rever código amanhã"
   ```

2. **Tarefa com Prioridade**
   ```
   "Cria uma tarefa urgente para bug crítico do login"
   ```

3. **Tarefa Completa**
   ```
   "Adiciona uma tarefa de alta prioridade para implementar API no projeto Frontend para semana que vem"
   ```

4. **Editar Tarefa**
   ```
   "Muda a prioridade da última tarefa para média"
   ```

5. **Atribuir Tarefa**
   ```
   "Atribui a tarefa ao João Silva"
   ```

### Resposta Esperada

O TaskBot irá:
1. ✍️ Processar seu comando
2. 🧠 Extrair dados estruturados (título, prioridade, data, etc.)
3. 📋 Exibir os dados extraídos na seção "Última tarefa detectada"
4. ✅ Permitir criar a tarefa ou fazer ajustes

## 🔌 Integração com API

### Configuração de Variáveis

**Arquivo:** `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
```

### Endpoints Esperados

O backend deve ter:

```javascript
// Chat
POST /api/chat
{
  "message": "...",
  "conversationHistory": [...],
  "model": "gemini-3-flash"
}

// Tarefas
POST /api/tasks          // Criar
GET /api/tasks           // Listar
GET /api/tasks/:id       // Obter
PUT /api/tasks/:id       // Atualizar
DELETE /api/tasks/:id    // Deletar
```

## 🎨 Componentes Principais

### Chat Component

```jsx
<Chat onTaskCreated={(taskData) => {
  console.log('Nova tarefa:', taskData);
}} />
```

**Props:**
- `onTaskCreated` - Função chamada quando uma tarefa é detectada

**Subcomponentes:**
- `ChatMessage` - Renderiza uma mensagem individual
- `ChatInput` - Input para enviar mensagens

### Dashboard Component

```jsx
<Dashboard />
```

Exibe:
- Estatísticas (total de tarefas, em progresso, concluídas)
- Lista de tarefas em cards
- Botão para criar nova tarefa

## 🛠️ Desenvolvimento

### Adicionar Novo Componente

```jsx
// src/components/NewComponent.jsx
export function NewComponent() {
  return <div>Novo Componente</div>;
}

// Adicionar em src/components/index.js
export { NewComponent } from './NewComponent';
```

### Usar Serviço de Chat

```jsx
import { chatService } from '@/services/chatService';

// Enviar mensagem
const response = await chatService.sendMessage('Minha mensagem');

// Extrair dados de tarefa
const taskData = chatService.extractTaskData(response.message);

// Criar tarefa
await chatService.createTask(taskData);
```

## 📊 Estrutura de Dados

### Tarefa (Task)

```javascript
{
  id: 1,
  title: "Rever código",
  description: "Revisar pull requests",
  status: "em progresso",
  priority: "alta",
  assignee: "João",
  dueDate: "2026-05-10"
}
```

### Mensagem do Chat

```javascript
{
  id: 1,
  text: "Olá! Sou o TaskBot...",
  sender: "bot" // ou "user"
}
```

## 🎨 Customização de Estilos

O projeto usa **Tailwind CSS** para estilos. Customize em:

```css
/* src/index.css */
@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  @apply m-0 bg-[#0d0d0d] text-[#ececec];
}
```

## 🚨 Troubleshooting

### Chat não funciona

1. Verifique se `.env` tem `VITE_API_URL` correto
2. Verifique se o backend está rodando na porta 5000
3. Abra DevTools (F12) e veja os erros de rede

### Tarefas não aparecem

1. Verifique a resposta da API em DevTools → Network
2. Confirme que `onTaskCreated` está sendo chamado
3. Adicione logs em `chatService.js`

### Estilos estranhos

1. Limpe o cache: `npm run dev` com CTRL+Shift+R no navegador
2. Verifique se `index.css` está sendo importado em `main.jsx`
3. Confirme que Tailwind está configurado em `vite.config.js`

## 📚 Documentação

- [TASKBOT_INTEGRATION.md](./TASKBOT_INTEGRATION.md) - Detalhes de integração
- [package.json](./package.json) - Dependências do projeto
- [vite.config.js](./vite.config.js) - Configuração do Vite

## 🤝 Contribuição

Para adicionar features:

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Faça suas mudanças
3. Teste localmente: `npm run dev`
4. Commit: `git commit -m "Add: nova feature"`
5. Push: `git push origin feature/nova-feature`

## 📄 Licença

Este projeto faz parte do curso IA & DEV.

## 🔗 Links Úteis

- [Projeto Frontend Original](../exemplos/frontend)
- [Backend Node.js](../backend)
- [Projeto HTML (Especificações)](../projeto.html)
- [Análise Completa do Frontend](../ANALISE_FRONTEND.md)

## 👨‍💻 Autor

Desenvolvido como parte do Projeto Final - Skill Course UpSkill

**Data:** 5 de Maio de 2026  
**Status:** ✅ Em Desenvolvimento
