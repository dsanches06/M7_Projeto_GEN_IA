import { getBackendUrl } from "../services/BaseService.js";
import { Task } from "../models/Task.js";

export const BACKEND_URL = getBackendUrl();

function getPriorityLabel(priorityId) {
  const priorities = {
    1: "baixa",
    2: "média",
    3: "alta",
  };
  return priorities[priorityId] || "média";
}

function getStatusLabel(statusId) {
  const statuses = {
    1: "criada",
    2: "atribuída",
    3: "em progresso",
    4: "bloqueada",
    5: "concluída",
    6: "arquivada",
  };
  return statuses[statusId] || "criada";
}

function normalizeTaskPayload(taskData) {
  const task = Task.fromObject(taskData);
  return task ? task.toPayload() : Task.fromObject({}).toPayload();
}

function transformTaskForDisplay(task) {
  return {
    ...task,
    priority: getPriorityLabel(task.priority_id),
    status: getStatusLabel(task.status_id),
    dueDate: task.due_date
      ? new Date(task.due_date).toLocaleDateString("pt-PT")
      : "N/A",
  };
}

export { transformTaskForDisplay };

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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Erro ao salvar tarefa no backend");
  }

  return response.json();
}
