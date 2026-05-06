# Bot GenAI - Integração Frontend

Este guia explica como usar o Bot GenAI com function calls no seu projeto React/Vite.

## 🚀 Arquivos Criados

### 1. **Serviço de Bot** (`src/services/botService.js`)
Serviço que faz a comunicação com o backend. Inclui:
- `sendMessageToBot()` - Enviar mensagem com function calls
- `sendMessageToConversation()` - Enviar em conversa específica
- `extractTaskDataFromFunctionResult()` - Extrair dados de tarefa
- `hasFunctionResults()` - Verificar se há resultados
- `getFirstFunctionResult()` - Obter primeiro resultado

### 2. **Componente ChatBot** (`src/components/chat/ChatBot.jsx`)
Componente React completo com:
- ✅ Interface de chat
- ✅ Envio de mensagens
- ✅ Exibição de resultados de function calls
- ✅ Botão para criar tarefas
- ✅ Histórico de conversa
- ✅ Tratamento de erros

### 3. **Página de Exemplo** (`src/pages/ChatBotPage.jsx`)
Página simples para demonstrar o uso

### 4. **Exemplos de Código** (`src/components/chat/examples.jsx`)
5 exemplos diferentes de integração

## 📋 Configuração

### Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# Backend URL
VITE_BACKEND_URL=http://localhost:3000
```

### Instalação do Componente

1. O `botService.js` já está pronto para usar
2. O `ChatBot.jsx` já está pronto para usar

## 💻 Uso Básico

### Opção 1: Componente Completo

```jsx
import { ChatBot } from '@/components/chat/ChatBot';

function App() {
  return (
    <div>
      <ChatBot />
    </div>
  );
}
```

### Opção 2: Serviço Direto

```jsx
import { botService } from '@/services/botService';
import { useState } from 'react';

function MyComponent() {
  const [response, setResponse] = useState(null);

  const handleSendMessage = async () => {
    const result = await botService.sendMessageToBot(
      'Crie uma tarefa para implementar login'
    );
    setResponse(result);
    console.log('Resultado:', result);
  };

  return (
    <div>
      <button onClick={handleSendMessage}>Enviar</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}
```

### Opção 3: Hook Customizado

```jsx
import { useBot } from '@/components/chat/examples';

function MyComponent() {
  const { sendMessage, loading, error } = useBot();

  const handleSend = async () => {
    try {
      const response = await sendMessage('Sua mensagem');
      console.log('Resposta:', response);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## 🔄 Fluxo de Funcionamento

```
┌─────────────────┐
│ Usuário digita  │
│   mensagem      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  botService.sendMessage │  ← Fetch para /bot/message
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│  Backend GenAI       │
│  - Analisa texto     │
│  - Executa função    │
└────────┬─────────────┘
         │
         ▼
┌─────────────────────────┐
│  Response com resultado │
│  da função (task data)  │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Frontend exibe:         │
│  - Mensagem do bot       │
│  - Resultado da função   │
│  - Botão "Criar Tarefa"  │
└──────────────────────────┘
```

## 📤 Estrutura da Resposta

```json
{
  "success": true,
  "message": "Tarefa processada com sucesso",
  "functionResults": [
    {
      "functionName": "set_create_task_values",
      "result": {
        "title": "Implementar login",
        "description": "Implementar sistema de autenticação",
        "types_id": 1,
        "status_id": 1,
        "priority_id": 2,
        "category_id": 5,
        "project_id": 10,
        "due_date": "2026-05-13T23:59:59Z",
        "estimated_hours": 8
      }
    }
  ],
  "updatedHistory": [/* histórico atualizado */]
}
```

## 🎯 Exemplo Prático Completo

```jsx
import { useState } from 'react';
import { botService } from '@/services/botService';

export function TaskCreatorBot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Enviar mensagem para o bot
      const result = await botService.sendMessageToBot(message);

      if (!result.success) {
        throw new Error(result.error);
      }

      setResponse(result);
      setMessage('');

      // 2. Se houver resultado de função, oferecer criar tarefa
      if (botService.hasFunctionResults(result)) {
        const functionResult = botService.getFirstFunctionResult(result);
        handleCreateTask(functionResult);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (functionResult) => {
    try {
      const taskData = botService.extractTaskDataFromFunctionResult(
        functionResult
      );

      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Erro ao criar tarefa');

      const task = await response.json();
      alert(`✅ Tarefa "${task.title}" criada com sucesso!`);
    } catch (err) {
      setError(`Erro ao criar tarefa: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1>🤖 Criador de Tarefas com IA</h1>

      <form onSubmit={handleSendMessage} className="mt-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: Criar tarefa para implementar autenticação"
          rows={3}
          className="w-full p-3 border rounded"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '⏳ Processando...' : '📤 Enviar'}
        </button>
      </form>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700">{error}</div>}

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3>Resposta do Bot:</h3>
          <p className="mt-2">{response.message}</p>

          {response.functionResults?.length > 0 && (
            <div className="mt-4">
              <h4>Dados da Tarefa:</h4>
              <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto">
                {JSON.stringify(response.functionResults[0].result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## 🔌 Integração com Rotas

Se você tem um router (React Router), adicione assim:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatBotPage } from '@/pages/ChatBotPage';
import { TaskCreatorBot } from '@/components/TaskCreatorBot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chatbot" element={<ChatBotPage />} />
        <Route path="/task-creator" element={<TaskCreatorBot />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## ⚙️ Troubleshooting

### Erro: "Cannot fetch from http://localhost:3000"
- ✅ Certifique-se que o backend está rodando na porta 3000
- ✅ Verifique CORS no backend
- ✅ Adicione `VITE_BACKEND_URL` no `.env`

### Erro: "Function call não retornou resultados"
- ✅ Verifique se a mensagem ativa uma função
- ✅ Teste com: "Crie uma tarefa para..."
- ✅ Veja os logs do backend

### Mensagem: "Sem resposta do modelo"
- ✅ Verifique a chave API `GENAI_API_KEY` no backend
- ✅ Verifique conexão com internet
- ✅ Veja logs no backend

## 📝 Próximos Passos

- [ ] Adicionar autenticação
- [ ] Implementar salvamento de conversas
- [ ] Adicionar mais funções além de `set_create_task_values`
- [ ] Implementar streaming de respostas
- [ ] Adicionar suporte a anexos
- [ ] Implementar rate limiting

## 📚 Referências

- [Backend GenAI](../backend/BOT_ENDPOINT_GUIDE.md)
- [Google GenAI API](https://github.com/google-labs/genai)
- [React Documentation](https://react.dev)
