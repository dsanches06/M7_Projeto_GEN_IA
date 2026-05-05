import { get, getById, create, put, remove } from "./index.js";
import { TaskStatusDTORequest } from "./dto/index.js";

const ENDPOINT = "task_status";

/* Função para obter todos os status de tarefa */
export async function getTaskStatuses(
  sort?: string,
  search?: string,
): Promise<TaskStatusDTORequest[]> {
  return get<TaskStatusDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um status de tarefa por ID */
export async function getTaskStatusById(
  id: number,
): Promise<TaskStatusDTORequest | null> {
  return getById<TaskStatusDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo status de tarefa */
export async function createTaskStatus(
  status: Partial<TaskStatusDTORequest>,
): Promise<TaskStatusDTORequest | null> {
  return create<TaskStatusDTORequest>(ENDPOINT, status);
}

/* Função para atualizar um status de tarefa */
export async function updateTaskStatus(
  id: number,
  status: Partial<TaskStatusDTORequest>,
): Promise<TaskStatusDTORequest | null> {
  return put<TaskStatusDTORequest>(ENDPOINT, id, status);
}

/* Função para deletar um status de tarefa */
export async function deleteTaskStatus(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

