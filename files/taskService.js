import { getBackendUrl } from "../services/BaseService.js";
import { Task } from "../models/Task.js";

export const BACKEND_URL = getBackendUrl();

// ── Status / priority maps ────────────────────────────────────────────────────
function getPriorityLabel(priorityId) {
  return { 1: "baixa", 2: "média", 3: "alta" }[priorityId] || "média";
}

function getStatusLabel(statusId) {
  return (
    { 1: "criada", 2: "atribuída", 3: "em progresso", 4: "bloqueada", 5: "concluída", 6: "arquivada" }[statusId] ||
    "criada"
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

// ── Payload normaliser (for task creation) ────────────────────────────────────
function normalizeTaskPayload(taskData) {
  const task = Task.fromObject(taskData);
  return task ? task.toPayload() : Task.fromObject({}).toPayload();
}

// ── Display transform ─────────────────────────────────────────────────────────
export function transformTaskForDisplay(task) {
  return {
    ...task,
    priority:     getPriorityLabel(task.priority_id),
    status:       getStatusLabel(task.status_id),
    statusName:   STATUS_ID_TO_NAME[task.status_id] || "CREATED",
    dueDate:      task.due_date
      ? new Date(task.due_date).toLocaleDateString("pt-PT")
      : "N/A",
    // preserve existing enrichment if already set
    assigneeName: task.assigneeName ?? null,
    tags:         task.tags         ?? [],
  };
}

// ── Fetch all tasks enriched with user names + tags ───────────────────────────
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

  // Build look-up maps
  const userMap = {};
  users.forEach((u) => { userMap[u.id] = u.name; });

  const tagMap = {};
  tags.forEach((t) => { tagMap[t.id] = t; });

  // Group tags by task_id
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

// ── Create task ───────────────────────────────────────────────────────────────
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
