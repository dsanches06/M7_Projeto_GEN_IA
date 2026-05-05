# React Components - Frontend UI Library

Biblioteca de componentes React convertida do `TS/frontend/src/ui` para o projeto REACT/clickUp.

## 📁 Estrutura de Componentes

### `/components/users/`
- **UserCard.tsx** - Componente de cartão flip de utilizador com ações
- **UsersList.tsx** - Lista com grid de utilizadores e busca
- **CSS Files** - Estilos responsivos para desktop e mobile

**Funcionalidades:**
- Flip card com avatar e informações do utilizador
- Botões de ação: editar, ver detalhes, ver tarefas, atribuir/remover tarefas
- Toggle de status (ativo/inativo)
- Busca por nome ou email
- Grid responsivo

### `/components/projects/`
- **ProjectCard.tsx** - Componente de cartão de projeto
- **ProjectsList.tsx** - Lista com grid de projetos
- **CSS Files** - Estilos responsivos

**Funcionalidades:**
- Informações do projeto: nome, descrição, status, datas
- Barra de progresso
- Botões de ação: editar, deletar, ver Gantt
- Filtro por status (Planejamento, Ativo, Pausado, Completado)
- Busca por nome e descrição
- Contador de membros da equipe

### `/components/common/`
- **Modal.tsx** - Componente modal reutilizável
- **Toast.tsx** - Sistema de notificações toast
- **CSS Files** - Estilos para modais e notificações

**Funcionalidades:**
- Modal com header, body e footer
- Suporte para confirmação e cancelamento
- Sistema de toast com tipos: success, error, info, warning
- Auto-dismiss configurável
- Animações suaves

### `/components/dashboard/`
- **Dashboard.tsx** - Painel principal com abas
- **CSS Files** - Estilos do dashboard

**Funcionalidades:**
- Abas para Utilizadores e Projetos
- Integração de todos os componentes
- Header com branding
- Transições suaves entre abas

## 🚀 Como Usar

### Exemplo Básico

```typescript
import { Dashboard, ToastProvider } from './components'

function App() {
  return (
    <ToastProvider>
      <Dashboard mockUsers={users} mockProjects={projects} />
    </ToastProvider>
  )
}
```

### UserCard Individual

```typescript
import { UserCard } from './components/users'

<UserCard
  user={user}
  onEdit={(user) => console.log('Edit:', user)}
  onDelete={(id) => console.log('Delete:', id)}
  taskCount={5}
/>
```

### UsersList com Dados

```typescript
import { UsersList } from './components/users'

<UsersList
  users={users}
  loading={false}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewTasks={handleViewTasks}
/>
```

### ProjectCard Individual

```typescript
import { ProjectCard } from './components/projects'

<ProjectCard
  project={project}
  onEdit={(project) => console.log('Edit:', project)}
  onDelete={(id) => console.log('Delete:', id)}
  onViewGantt={(id) => console.log('View Gantt:', id)}
/>
```

### Modal Reutilizável

```typescript
import { Modal } from './components/common'

<Modal
  isOpen={isOpen}
  title="Editar Utilizador"
  onClose={() => setIsOpen(false)}
  onConfirm={handleSave}
  confirmText="Salvar"
>
  {/* Conteúdo do modal */}
</Modal>
```

### Toast Notifications

```typescript
import { useToast } from './components/common'

function MyComponent() {
  const { showToast } = useToast()
  
  const handleSave = async () => {
    try {
      await saveUser(userData)
      showToast('Utilizador salvo com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao salvar utilizador', 'error')
    }
  }
  
  return <button onClick={handleSave}>Salvar</button>
}
```

## 📋 Interfaces de Dados

### User
```typescript
interface User {
  id: number
  name: string
  email: string
  phone: string
  gender: 'M' | 'F' | 'O'
  is_active: boolean
}
```

### Project
```typescript
interface Project {
  id: number
  name: string
  description: string
  status: 'Planning' | 'Active' | 'Paused' | 'Completed'
  start_date: string        // YYYY-MM-DD
  end_date_expected: string // YYYY-MM-DD
  team_id: number
  progress?: number         // 0-100
}
```

## 🎨 Styling

Todos os componentes incluem estilos CSS responsivos:
- **Desktop**: Grid 3 colunas para cards
- **Tablet**: Grid 2 colunas
- **Mobile**: 1 coluna com layout adaptado

As cores seguem um esquema moderno com gradientes azul-púrpura.

## 🔄 Próximos Passos

Para conectar com o backend real:

1. Substituir dados mock por chamadas de API
2. Implementar os handlers de ações (onEdit, onDelete, etc.)
3. Criar formulários modais para Create/Edit
4. Integrar com serviços do `TS/frontend/src/services/`
5. Adicionar autenticação e controle de permissões

## 📝 Notas

- Componentes são totalmente controlados pelos props
- Estado de UI (abas, busca) é gerenciado internamente
- Lógica de negócio deve ser implementada no componente pai
- Todos os handlers são opcionais e podem ser passados como props

## 🔧 Manutenção

Para adicionar novos componentes:

1. Criar pasta em `/components/[feature]/`
2. Criar arquivo TypeScript com export nomeado
3. Criar arquivo CSS correspondente
4. Exportar em `index.ts` da pasta
5. Adicionar ao export em `/components/index.ts`
