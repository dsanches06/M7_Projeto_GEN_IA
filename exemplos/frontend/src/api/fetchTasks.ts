import { get, getById, create, put, patch, remove, request } from "./index.js";
import {
  TaskDTORequest,
  TaskCommentDTORequest,
  TagDTORequest,
  TaskStatsDTORequest,
  TagTaskDTORequest,
} from "./dto/index.js";

const ENDPOINT = "tasks";

/* ======================== GET ======================== */

/* Função para obter a lista de tarefas */
export async function getTasks(
  sort?: string,
  search?: string,
): Promise<TaskDTORequest[]> {
  return get<TaskDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter tarefas de um projeto específico */
export async function getTasksByProject(
  projectId: number,
  sort?: string,
  search?: string,
): Promise<TaskDTORequest[]> {
  return get<TaskDTORequest>(`${ENDPOINT}/project/${projectId}`, sort, search);
}

/* Função para obter uma tarefa por ID */
export async function getTaskById(taskId: number): Promise<TaskDTORequest | null> {
  return getById<TaskDTORequest>(ENDPOINT, taskId);
}

/* Função para obter estatísticas de tarefas */
export async function getTaskStats(): Promise<TaskStatsDTORequest | null> {
  const stats = await get<TaskStatsDTORequest>(`${ENDPOINT}/stats`);
  return stats ? stats[0] || null : null;
}

/* Função para obter tags de uma tarefa */
export async function getTaskTags(taskId: number): Promise<TagDTORequest[]> {
  const data = await request<TagDTORequest[]>(`${ENDPOINT}/${taskId}/tags`);
  return data ?? [];
}

/* Função para obter comentários de uma tarefa */
export async function getTaskComments(
  taskId: number,
): Promise<TaskCommentDTORequest[]> {
  const data = await request<TaskCommentDTORequest[]>(`${ENDPOINT}/${taskId}/comments`);
  return data ?? [];
}

/* Função para criar uma nova tarefa */
export async function createTask(
  taskData: Partial<TaskDTORequest>,
): Promise<TaskDTORequest | null> {
  return create<TaskDTORequest>(ENDPOINT, taskData);
}

/* Função para adicionar uma tag a uma tarefa */
export async function addTagToTask(taskId: number, tagData: Partial<TagTaskDTORequest>): Promise<TagTaskDTORequest | null> {
  return request<TagTaskDTORequest>(`${ENDPOINT}/${taskId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tagData),
  });
}

/* Função para criar um comentário em uma tarefa */
export async function createTaskComment(
  taskId: number,
  commentData: Partial<TaskCommentDTORequest>,
): Promise<TaskCommentDTORequest | null> {
  return request<TaskCommentDTORequest>(`${ENDPOINT}/${taskId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });
}

/* Função para atualizar uma tarefa */
export async function updateTask(
  taskId: number,
  taskData: Partial<TaskDTORequest>,
): Promise<TaskDTORequest | null> {
  return put<TaskDTORequest>(ENDPOINT, taskId, taskData);
}

/* Função para atualizar parcialmente uma tarefa (datas, descrição, etc) */
export async function partialUpdateTask(
  taskId: number,
  updates: Partial<TaskDTORequest>,
): Promise<boolean> {
  const result = await patch<TaskDTORequest>(ENDPOINT, taskId, updates);
  return result !== null;
}

/* Função para atualizar um comentário */
export async function updateTaskComment(
  taskId: number,
  commentId: number,
  commentData: Partial<TaskCommentDTORequest>,
): Promise<TaskCommentDTORequest | null> {
  return request<TaskCommentDTORequest>(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });
}

/* Função para atualizar o status de uma tarefa */
export async function changeTaskStatus(
  taskId: number,
  statusId: number,
): Promise<TaskDTORequest | null> {
  return request<TaskDTORequest>(`${ENDPOINT}/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_status_id: statusId }),
  });
}

/* Função para resolver um comentário */
export async function resolveTaskComment(
  taskId: number,
  commentId: number,
): Promise<TaskCommentDTORequest | null> {
  return request<TaskCommentDTORequest>(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/* Função para deletar uma tarefa */
export async function deleteTask(taskId: number): Promise<boolean> {
  return remove(ENDPOINT, taskId);
}

/* Função para remover uma tag de uma tarefa */
export async function removeTagFromTask(
  taskId: number,
  tagId: number,
): Promise<boolean> {
  const result = await request(`${ENDPOINT}/${taskId}/tags/${tagId}`, {
    method: "DELETE",
  });
  return result !== null;
}

/* Função para deletar um comentário */
export async function deleteTaskComment(
  taskId: number,
  commentId: number,
): Promise<boolean> {
  const result = await request(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
    method: "DELETE",
  });
  return result !== null;
}

