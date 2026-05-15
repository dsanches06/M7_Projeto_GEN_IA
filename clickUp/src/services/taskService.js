import { getBackendUrl } from "../services/BaseService.js";
import { Task } from "../models/Task.js";

export const BACKEND_URL = getBackendUrl();

// ── Mapas de status / prioridade ──────────────────────────────────────────────

// Converte ID de prioridade para label em português
function getPriorityLabel(priorityId) {
  return { 1: "baixa", 2: "média", 3: "alta" }[priorityId] || "média";
}

// Converte ID de estado para label em português
function getStatusLabel(statusId) {
  return (
    {
      1: "criada",
      2: "atribuída",
      3: "em progresso",
      4: "bloqueada",
      5: "concluída",
      6: "arquivada",
    }[statusId] || "criada"
  );
}

/** String status names used by UserDashboard kanban columns */
export const STATUS_ID_TO_NAME = {
  1: "CREATED",
  2: "ASSIGNED",
  3: "IN_PROGRESS",
  4: "BLOCKED",
  5: "COMPLETED",
  6: "ARCHIVED",
};

// ── Normalização de payload ───────────────────────────────────────────────────

// Normaliza dados de tarefa usando o modelo Task antes de enviar ao backend
function normalizeTaskPayload(taskData) {
  const task = Task.fromObject(taskData);
  return task ? task.toPayload() : Task.fromObject({}).toPayload();
}

// ── Transformação para exibição ───────────────────────────────────────────────

// Enriquece uma tarefa com campos calculados (prioridade, estado, data, etc.)
export function transformTaskForDisplay(task) {
  const createdAt = task.created_at || task.createdAt || new Date().toISOString();

  return {
    ...task,
    created_at: createdAt,
    createdAt,
    priority:     getPriorityLabel(task.priority_id),
    status:       getStatusLabel(task.status_id),
    statusName:   STATUS_ID_TO_NAME[task.status_id] || "CREATED",
    dueDate:      task.due_date
      ? new Date(task.due_date).toLocaleDateString("pt-PT")
      : "N/A",
    assigneeName: task.assigneeName ?? null,
    tags:         task.tags         ?? [],
  };
}

// ── Busca todas as tarefas com utilizadores e etiquetas ───────────────────────

// Carrega tarefas em paralelo com utilizadores e etiquetas; devolve lista enriquecida
export async function fetchTasks() {
  const [tasksRes, usersRes, tagsTaskRes, tagsRes] = await Promise.all([
    fetch(`${BACKEND_URL}/tasks`),
    fetch(`${BACKEND_URL}/users`),
    fetch(`${BACKEND_URL}/tags_task`),
    fetch(`${BACKEND_URL}/tags`),
  ]);

  if (!tasksRes.ok) {
    throw new Error(`Erro ao carregar tarefas: ${tasksRes.statusText}`);
  }

  const tasks     = await tasksRes.json();
  const users     = usersRes.ok    ? await usersRes.json()    : [];
  const tagsTasks = tagsTaskRes.ok ? await tagsTaskRes.json() : [];
  const tags      = tagsRes.ok     ? await tagsRes.json()     : [];

  // Mapa de id → nome de utilizador
  const userMap = {};
  users.forEach((u) => { userMap[u.id] = u.name; });

  // Mapa de id → objecto de etiqueta
  const tagMap = {};
  tags.forEach((t) => { tagMap[t.id] = t; });

  // Agrupa etiquetas por task_id
  const taskTagsMap = {};
  tagsTasks.forEach((tt) => {
    if (!taskTagsMap[tt.task_id]) taskTagsMap[tt.task_id] = [];
    const tag = tagMap[tt.tag_id];
    if (tag) taskTagsMap[tt.task_id].push(tag);
  });

  return tasks.map((task) => ({
    ...transformTaskForDisplay(task),
    assigneeName: task.assigned_to
      ? userMap[task.assigned_to] || `Utilizador #${task.assigned_to}`
      : null,
    tags: taskTagsMap[task.id] || [],
  }));
}

// Cria uma nova tarefa no backend
export async function createTask(taskData) {
  const payload = normalizeTaskPayload(taskData);
  const response = await fetch(`${BACKEND_URL}/tasks`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Erro ao salvar tarefa no backend");
  }

  return response.json();
}
