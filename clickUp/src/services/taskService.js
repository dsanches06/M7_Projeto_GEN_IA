import { BACKEND_URL } from './chatService';

function getPriorityLabel(priorityId) {
  const priorities = {
    1: 'baixa',
    2: 'média',
    3: 'alta',
  };
  return priorities[priorityId] || 'média';
}

function getStatusLabel(statusId) {
  const statuses = {
    1: 'criada',
    2: 'atribuída',
    3: 'em progresso',
    4: 'bloqueada',
    5: 'concluída',
    6: 'arquivada',
  };
  return statuses[statusId] || 'criada';
}

function normalizeTaskPayload(taskData) {
  return {
    title: taskData.title || taskData.task || '',
    description: taskData.description || taskData.body || '',
    types_id: taskData.types_id ?? taskData.type_id ?? taskData.typeId ?? 1,
    status_id: taskData.status_id ?? taskData.status_id ?? 1,
    priority_id: taskData.priority_id ?? taskData.priority_id ?? 1,
    category_id: taskData.category_id ?? taskData.category_id ?? 1,
    project_id: taskData.project_id ?? taskData.project_id ?? 1,
    created_at: taskData.created_at || taskData.createdAt || new Date().toISOString(),
    due_date: taskData.due_date || taskData.dueDate || new Date().toISOString(),
    completed_at: taskData.completed_at ?? taskData.completedAt ?? null,
    estimated_hours: taskData.estimated_hours ?? taskData.estimatedHours ?? 0,
    assignee: taskData.assignee || 'Não atribuído',
  };
}

function transformTaskForDisplay(task) {
  return {
    ...task,
    priority: getPriorityLabel(task.priority_id),
    status: getStatusLabel(task.status_id),
    dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-PT') : 'N/A',
  };
}

export async function fetchTasks() {
  const response = await fetch(`${BACKEND_URL}/tasks`);
  if (!response.ok) {
    throw new Error(`Erro ao carregar tarefas: ${response.statusText}`);
  }
  const tasks = await response.json();
  return tasks.map(transformTaskForDisplay);
}

export async function createTask(taskData) {
  const payload = normalizeTaskPayload(taskData);
  const response = await fetch(`${BACKEND_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Erro ao salvar tarefa no backend');
  }

  return response.json();
}
