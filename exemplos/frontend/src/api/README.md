# API Client - Guia de Uso

## Visão Geral

A pasta `api/` contém um cliente HTTP genérico (`apiClient.ts`) com funções reutilizáveis para operações CRUD (Create, Read, Update, Delete) em qualquer endpoint da API.

## Funções Genéricas Disponíveis

### 1. `get<T>(endpoint: string, sort?: string, search?: string): Promise<T[]>`

Obtém uma lista de recursos com suporte a sordenação e busca.

**Exemplo:**
```typescript
import { get } from "@/api/apiClient.js";

// Obter todos os usuários
const users = await get("users");

// Obter com filtros
const activeUsers = await get("users", "name:asc", "status:active");
```

---

### 2. `getById<T>(endpoint: string, id: number | string): Promise<T | null>`

Obtém um recurso específico por ID.

**Exemplo:**
```typescript
import { getById } from "@/api/apiClient.js";

const user = await getById("users", 1);
if (user) {
  console.log(user.name);
}
```

---

### 3. `create<T>(endpoint: string, payload: any): Promise<T | null>`

Cria um novo recurso.

**Exemplo:**
```typescript
import { create } from "@/api/apiClient.js";

const newUser = await create("users", {
  name: "João Silva",
  email: "joao@example.com",
  role: "user"
});
```

---

### 4. `put<T>(endpoint: string, id: number | string, payload: any): Promise<T | null>`

Atualiza um recurso completamente (PUT).

**Exemplo:**
```typescript
import { put } from "@/api/apiClient.js";

const updated = await put("users", 1, {
  name: "João Silva Atualizado",
  email: "novo@example.com"
});
```

---

### 5. `patch<T>(endpoint: string, id: number | string, payload: any): Promise<T | null>`

Atualiza um recurso parcialmente (PATCH).

**Exemplo:**
```typescript
import { patch } from "@/api/apiClient.js";

const updated = await patch("users", 1, {
  status: "inactive"
});
```

---

### 6. `remove(endpoint: string, id: number | string): Promise<boolean>`

Deleta um recurso.

**Exemplo:**
```typescript
import { remove } from "@/api/apiClient.js";

const deleted = await remove("users", 1);
if (deleted) {
  console.log("Usuário deletado com sucesso");
}
```

---

## Padrão de Uso em Arquivos Específicos

Os arquivos `fetchXxx.ts` funcionam como wrappers que abstraem o endpoint e oferecem uma interface mais amigável:

### Exemplo: fetchUsers.ts

```typescript
import { get, getById, create, put, remove } from "./apiClient.js";

const ENDPOINT = "users";

export async function getUsers(sort?: string, search?: string) {
  return get(ENDPOINT, sort, search);
}

export async function getUserById(id: number) {
  return getById(ENDPOINT, id);
}

export async function createUser(userData) {
  return create(ENDPOINT, userData);
}

export async function updateUser(id: number, userData) {
  return put(ENDPOINT, id, userData);
}

export async function deleteUser(id: number) {
  return remove(ENDPOINT, id);
}
```

### Uso em componentes:

```typescript
import { getUsers, createUser, deleteUser } from "@/api/index.js";

// Obter lista
const users = await getUsers("role:asc", "active");

// Criar novo
const newUser = await createUser({
  name: "Maria",
  email: "maria@example.com"
});

// Deletar
const deleted = await deleteUser(1);
```

---

## Tratamento de Erros

As funções genéricas já possuem tratamento de erros integrado:

- Em caso de erro HTTP, uma mensagem é console.error
- A função retorna `[]` (para `get`) ou `null` (para outras operações)

Para tratamento mais específico:

```typescript
const user = await getById("users", 999);
if (user === null) {
  console.log("Usuário não encontrado");
} else {
  console.log(user);
}
```

---

## Mapeamento de Dados

Alguns endpoints retornam dados que precisam ser convertidos para classes específicas (ex: `UserClass`, `Project`).

Exemplo em `fetchUsers.ts`:

```typescript
import { get } from "./apiClient.js";
import { UserClass } from "../models/index.js";

const ENDPOINT = "users";

export async function getUsers(sort?: string, search?: string) {
  const data = await get(ENDPOINT, sort, search);
  // Mapear dados planos para instâncias de UserClass
  return data.map(item => new UserClass(item.id, item.name, ...));
}
```

---

## Endpoints Suportados

| Recurso | Endpoint | Arquivo |
|---------|----------|---------|
| Usuários | `users` | `fetchUsers.ts` |
| Tarefas | `tasks` | `fetchTasks.ts` |
| Projetos | `projects` | `fetchProjects.ts` |
| Categorias | `categories` | `fetchCategories.ts` |
| Tags | `tags` | `fetchTags.ts` |
| Equipes | `teams` | `fetchTeams.ts` |
| Sprints | `sprints` | `fetchSprints.ts` |
| Prioridades | `priorities` | `fetchPriorities.ts` |
| Status de Projeto | `project_status` | `fetchProjectStatus.ts` |
| Status de Tarefa | `task_status` | `fetchTaskStatus.ts` |
| Notificações | `notifications` | `fetchNotifications.ts` |

---

## Dicas Importantes

1. **Sempre use os wrappers**: Em vez de importar direto de `apiClient.ts`, use `fetchXxx.ts`. Isso mantém o código organizado e permite customizações futuras.

2. **Tratamento de tipos**: Use genéricos para ter mejor tipagem:
   ```typescript
   const users = await get<IUser>("users");
   ```

3. **Console.table**: As funções já logam os dados com `console.table()` para debugging.

4. **Requisições encadeadas**: Você pode combinar múltiplas chamadas:
   ```typescript
   const users = await getUsers();
   const activeUsers = users.filter(u => u.active);
   ```

---

## Estrutura de Resposta da API

A API segue este padrão:

**Sucesso (200):**
```json
{
  "id": 1,
  "name": "João",
  "email": "joao@example.com",
  ...
}
```

**Erro (4xx/5xx):**
```json
{
  "error": "Recurso não encontrado",
  "status": 404
}
```

---
