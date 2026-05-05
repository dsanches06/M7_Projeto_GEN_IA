# 🚀 Integração TaskBot AI no Projeto ClickUp

## Visão Geral

Este documento descreve como o **TaskBot AI** (projeto do chat com Gemini 3 Flash) foi integrado no projeto **ClickUp** em React com Tailwind CSS.

---

## 1. Arquitetura de Integração

```
┌─────────────────────────────────────────────────────┐
│                   App.jsx                            │
│         (Orquestrador Principal)                     │
└────────────┬────────────────────────────┬────────────┘
             │                            │
      ┌──────▼──────┐            ┌────────▼────────┐
      │  Header      │            │  Toggle Button   │
      └──────────────┘            └──────────────────┘
             │
      ┌──────▼──────┐
      │  Sidebar     │
      │  + Dashboard │
      └──────────────┘
             │
      ┌──────▼──────────────┐
      │  Main Content Area   │
      │  ┌────────────────┐  │
      │  │  Dashboard     │  │ ┌──────────────────┐
      │  │  (Tarefas)     │  │ │    Chat.jsx      │
      │  └────────────────┘  │ │  (TaskBot AI)    │
      │                      │ │  ┌────────────┐  │
      │                      │ │  │ Mensagens  │  │
      │                      │ │  ├────────────┤  │
      │                      │ │  │ Chat Input │  │
      │                      │ │  ├────────────┤  │
      │                      │ │  │ Task Data  │  │
      │                      │ │  └────────────┘  │
      │                      │ └──────────────────┘
      └──────────────────────┘
             │
      ┌──────▼────────────────┐
      │  onTaskCreated Callback │
      │  (Atualiza Dashboard)   │
      └────────────────────────┘
```

---

## 2. Componentes Criados

### 2.1 Chat.jsx

**Localização:** `src/components/Chat.jsx`

**Componentes Exportados:**

```javascript
// Componente Principal
export function Chat({ onTaskCreated })

// Subcomponentes
export function ChatMessage({ message, sender })
export function ChatInput({ onSendMessage, disabled })
```

**Funcionalidades:**
- 💬 Histórico de mensagens com scroll automático
- ⏳ Indicador de carregamento (animado)
- 📋 Exibição de última tarefa detectada
- ✍️ Input com suporte a Shift+Enter
- 🔄 Callback para notificar tarefa criada

**Props:**
- `onTaskCreated` - Função chamada quando uma tarefa é detectada

---

### 2.2 chatService.js

**Localização:** `src/services/chatService.js`

**Métodos Implementados:**

```javascript
// Enviar mensagem ao Gemini
await chatService.sendMessage(message, conversationHistory)

// Extrair JSON estruturado da resposta
const taskData = chatService.extractTaskData(response)

// Operações de Tarefas
await chatService.createTask(taskData)
await chatService.updateTask(taskId, taskData)
await chatService.getTasks(filters)
```

**Configuração de API:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

---

## 3. Integração no App.jsx

```javascript
import { Chat } from "@/components";

function App() {
  const [showChat, setShowChat] = useState(true);
  const [newTask, setNewTask] = useState(null);

  const handleTaskCreated = (taskData) => {
    setNewTask(taskData);
    // Atualizar dashboard com nova tarefa
  };

  return (
    <div className="flex gap-4 p-4">
      <Sidebar />
      <Dashboard /> {/* Main content */}
      {showChat && <Chat onTaskCreated={handleTaskCreated} />}
      <button onClick={() => setShowChat(!showChat)}>💬</button>
    </div>
  );
}
```

---

## 4. Fluxo de Dados

### Passo 1: Utilizador envia mensagem
```
User: "Adiciona uma tarefa urgente para rever código amanhã"
      ↓
ChatInput captura a mensagem
      ↓
onSendMessage dispara
```

### Passo 2: Enviada para API/Gemini
```
chatService.sendMessage(message, history)
      ↓
POST /api/chat com:
  - message: string
  - conversationHistory: array
  - model: "gemini-3-flash"
      ↓
API retorna: { message: "..." }
```

### Passo 3: Exibição da resposta
```
ChatMessage renderiza resposta do bot
      ↓
Tentativa de extrair JSON
      ↓
Se houver taskData: mostrar na seção "Última tarefa detectada"
```

### Passo 4: Criação de tarefa (opcional)
```
Se utilizador confirmar:
      ↓
chatService.createTask(taskData)
      ↓
onTaskCreated(taskData) é acionado
      ↓
Dashboard atualiza com nova tarefa
```

---

## 5. Estrutura de Mensagens

### Mensagem do Chat

```javascript
{
  id: 1,
  text: "Olá! Sou o TaskBot...",
  sender: "bot" // ou "user"
}
```

### Dados de Tarefa Esperados

Formato JSON extraído da resposta do Gemini:

```json
{
  "action": "CREATE",
  "task": "Rever código",
  "title": "Rever código",
  "priority": "URGENT",
  "space": "Desenvolvimento",
  "dueDate": "2026-05-05",
  "description": "Revisar pull requests pendentes"
}
```

---

## 6. Configuração de Variáveis de Ambiente

**Arquivo:** `clickUp/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Arquivo:** `clickUp/.env.example`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 7. Estilos Tailwind CSS Utilizados

### Temas de Cores

```javascript
// Fundo
bg-[#0d0d0d]  // Preto muito escuro
bg-[#1a1a1a]  // Preto escuro
bg-[#2a2a2a]  // Cinzento escuro

// Texto
text-white    // Branco
text-gray-300 // Cinzento claro
text-gray-400 // Cinzento médio

// Acentos
bg-blue-600   // Azul principal
border-[#333333]  // Bordas
```

### Componentes Chat

```css
/* Chat Container */
.chat-container = bg-[#1a1a1a] rounded-lg border border-[#333333]

/* Mensagem Bot */
.message-bot = bg-[#2a2a2a] text-gray-300 rounded-lg rounded-bl-none

/* Mensagem User */
.message-user = bg-blue-600 text-white rounded-lg rounded-br-none

/* Input Area */
.chat-input = bg-[#2a2a2a] border border-[#333333] focus:border-blue-500

/* Botão */
.btn-send = bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg
```

---

## 8. Funcionalidades Implementadas

### ✅ Core Features

- [x] Chat em tempo real com histórico
- [x] Extração de dados JSON da resposta
- [x] Exibição de última tarefa detectada
- [x] Interface responsiva
- [x] Animação de carregamento
- [x] Input com suporte a Shift+Enter
- [x] Callback para atualizar dashboard
- [x] Integração com serviço de API

### 🚀 Features Opcionais (Bónus)

- [ ] Speech-to-Text (Web Speech API)
- [ ] Function Calling (execução de ações)
- [ ] Temas Dinâmicos baseados em contexto
- [ ] Persistência de histórico (localStorage)
- [ ] Busca em histórico
- [ ] Exportar conversa como PDF
- [ ] Integração com notificações em tempo real

---

## 9. Como Usar

### 9.1 Iniciar o servidor

```bash
cd clickUp
npm install
npm run dev
```

### 9.2 Usar o Chat

1. Clique no botão 💬 para abrir/fechar o chat
2. Descreva uma tarefa em linguagem natural:
   - "Adiciona uma tarefa urgente para rever código amanhã"
   - "Muda a prioridade da última tarefa para média"
   - "Cria um projeto novo para o frontend"
3. O TaskBot irá:
   - Processar sua mensagem via Gemini 3 Flash
   - Extrair dados estruturados
   - Exibir a resposta e dados da tarefa
   - Permitir criação da tarefa no sistema

---

## 10. Estrutura de Ficheiros

```
clickUp/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TaskCard.jsx
│   │   ├── Chat.jsx           ← NOVO
│   │   └── index.js
│   ├── services/
│   │   └── chatService.js     ← NOVO
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── App.jsx                ← ATUALIZADO
│   ├── main.jsx
│   └── index.css
├── .env                        ← NOVO
├── .env.example               ← NOVO
├── index.html
├── vite.config.js
└── package.json
```

---

## 11. Próximas Etapas

### Curto Prazo

1. **Implementar Backend da API de Chat**
   - Endpoint POST `/api/chat` que integra Gemini
   - Middleware de autenticação
   - Rate limiting

2. **Testes da Integração**
   - Testar extração de JSON
   - Validar fluxo de criação de tarefas
   - Testar responsividade

3. **Melhorias de UX**
   - Adicionar ícones
   - Melhorar animações
   - Adicionar sugestões de comandos

### Médio Prazo

1. **Features Avançadas**
   - Speech-to-Text
   - Function Calling (executar ações de verdade)
   - Histórico persistente

2. **Integração Completa**
   - Conectar com dashboard real
   - Sincronizar tarefas com banco de dados
   - Notificações em tempo real

3. **Performance**
   - Otimizar re-renders
   - Implementar virtualização de mensagens
   - Cache de respostas

### Longo Prazo

1. **Expansão do TaskBot**
   - Adicionar mais domínios (NutriBot, Finance Guard, etc.)
   - Machine Learning para melhor análise
   - Multi-idioma

2. **Analytics**
   - Rastrear uso do chat
   - Análise de sentimento
   - Relatórios de produtividade

---

## 12. Referências

- [Projeto Original (projeto.html)](../projeto.html)
- [Análise Frontend Completa](../ANALISE_FRONTEND.md)
- [Documentação Gemini 3 Flash](https://ai.google.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)

---

**Atualizado:** 5 de Maio de 2026
**Versão:** 1.0
**Status:** ✅ Implementação Completa
