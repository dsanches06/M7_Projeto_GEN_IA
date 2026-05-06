# ChatBot GenAI - Endpoint Genérico com Function Calls

## Descrição

Endpoint genérico que permite enviar mensagens de chat e executar automaticamente function calls definidas pelo modelo GenAI.

## Endpoints

### 1. Enviar Mensagem ao Bot (Sem Histórico)

```
POST /bot/message
```

**Request Body:**
```json
{
  "message": "Crie uma tarefa para implementar a funcionalidade de login",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tarefa processada com sucesso",
  "functionResults": [
    {
      "functionName": "set_create_task_values",
      "result": {
        "title": "Implementar funcionalidade de login",
        "description": "Implementar sistema de autenticação com login seguro",
        "types_id": 1,
        "status_id": 1,
        "priority_id": 2,
        "category_id": 5,
        "project_id": 10,
        "created_at": "2026-05-06T10:30:00Z",
        "due_date": "2026-05-13T23:59:59Z",
        "completed_at": null,
        "estimated_hours": 8
      }
    }
  ],
  "updatedHistory": [
    // Histórico atualizado da conversa
  ]
}
```

### 2. Enviar Mensagem em uma Conversa Específica

```
POST /bot/conversation/:conversationId/message
```

**Request Body:**
```json
{
  "message": "Crie uma tarefa para implementar a funcionalidade de login com prioridade alta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tarefa processada com sucesso",
  "conversationId": 123,
  "functionResults": [
    {
      "functionName": "set_create_task_values",
      "result": { /* ... */ }
    }
  ],
  "updatedHistory": []
}
```

## Como Usar

### Exemplo com cURL

```bash
# Enviar mensagem simples
curl -X POST http://localhost:3000/bot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Crie uma tarefa para implementar a funcionalidade de login com prioridade alta",
    "conversationHistory": []
  }'
```

### Exemplo com JavaScript/Fetch

```javascript
// Enviar mensagem ao bot
async function sendMessageToBot(message, conversationHistory = []) {
  const response = await fetch('http://localhost:3000/bot/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory
    })
  });

  return await response.json();
}

// Usar
const result = await sendMessageToBot(
  'Crie uma tarefa para implementar a funcionalidade de login com prioridade alta'
);

console.log('Resultado da função:', result.functionResults);
console.log('Mensagem do modelo:', result.message);
```

### Exemplo com Histórico de Conversa

```javascript
// Manter histórico da conversa
let conversationHistory = [];

// Primeira mensagem
let result = await sendMessageToBot(
  'Crie uma tarefa para login',
  conversationHistory
);
conversationHistory = result.updatedHistory;

// Segunda mensagem (com contexto da conversa anterior)
result = await sendMessageToBot(
  'Aumente a prioridade dessa tarefa',
  conversationHistory
);
conversationHistory = result.updatedHistory;
```

## Como Adicionar Novas Function Declarations

### 1. Definir a Function Declaration

Edite `backend/src/functions/functions_declarations.js`:

```javascript
import { Type } from "@google/genai";

// Nova função
export const myFunctionDeclaration = {
  name: "my_function",
  description: "Descrição do que a função faz",
  parameters: {
    type: Type.OBJECT,
    properties: {
      param1: {
        type: Type.STRING,
        description: "Descrição do parâmetro"
      }
    },
    required: ["param1"]
  }
};

// Handler da função
export function myFunction(param1) {
  return {
    param1,
    result: "Processado"
  };
}
```

### 2. Registrar o Handler

Edite `backend/src/genAI/genAI.js`:

```javascript
import { myFunctionDeclaration, myFunction } from "../functions/functions_declarations.js";

// Adicionar ao mapa de handlers
const functionHandlers = {
  set_create_task_values: setCreateTaskValues,
  my_function: myFunction, // Adicionar aqui
};

// Adicionar à config
const config = {
  tools: [
    {
      functionDeclarations: [
        setTaskValuesFunctionDeclaration,
        myFunctionDeclaration, // Adicionar aqui
      ],
    },
  ],
};
```

Ou use a função `registerFunctionHandler`:

```javascript
import { registerFunctionHandler } from "../genAI/genAI.js";

registerFunctionHandler("my_function", myFunction);
```

## Fluxo de Funcionamento

```
┌─────────────────────────┐
│   Mensagem do Usuário   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   GenAI (Primeira Chamada)      │
│   - Analisa mensagem            │
│   - Pode chamar função          │
└────────────┬────────────────────┘
             │
             ▼
       ┌─────────────┐
       │ Function    │
       │ Call?       │
       └──┬──────┬───┘
          │      │
     Sim  │      │ Não
          │      │
          ▼      ▼
      ┌────┐  ┌────────────────┐
      │Exe-│  │ Retorna        │
      │cuta│  │ resposta       │
      │    │  │ diretamente    │
      └─┬──┘  └────────────────┘
        │
        ▼
    ┌────────────────────────────┐
    │ GenAI (Segunda Chamada)    │
    │ - Com resultado da função  │
    │ - Processa resultado       │
    └────────────┬───────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Resposta Final│
         └───────────────┘
```

## Tratamento de Erros

```json
{
  "success": false,
  "error": "Descrição do erro",
  "functionResults": []
}
```

## Próximos Passos

- [ ] Implementar salvamento de histórico no banco de dados
- [ ] Adicionar autenticação aos endpoints
- [ ] Implementar cache de conversas
- [ ] Adicionar limite de taxa (rate limiting)
- [ ] Implementar logging detalhado
- [ ] Adicionar suporte a múltiplos modelos
