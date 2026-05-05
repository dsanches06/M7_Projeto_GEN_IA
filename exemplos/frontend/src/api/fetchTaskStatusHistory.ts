import { get, getById, create, put, remove } from "./index.js";
import { TaskStatusHistoryDTORequest } from "./dto/index.js";

const ENDPOINT = "task_status_history";

/* Função para obter a lista do histórico de status de tarefas */ 
export async function getTaskStatusHistories(
  sort?: string,
  search?: string,
): Promise<TaskStatusHistoryDTORequest[]> {
  return get<TaskStatusHistoryDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um registro de histórico de status por ID */
export async function getTaskStatusHistoryById(
  id: number,
): Promise<TaskStatusHistoryDTORequest | null> {
  return getById<TaskStatusHistoryDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo registro de histórico de status */
export async function createTaskStatusHistory(
  history: Partial<TaskStatusHistoryDTORequest>,
): Promise<TaskStatusHistoryDTORequest | null> {
  return create<TaskStatusHistoryDTORequest>(ENDPOINT, history);
}

/* Função para editar ohistórico de status */
export async function updateTaskStatusHistory(
  id: number,
  history: Partial<TaskStatusHistoryDTORequest>,
): Promise<TaskStatusHistoryDTORequest | null> {
  return put<TaskStatusHistoryDTORequest>(ENDPOINT, id, history);
}

/* Função para deletar um registro de histórico de status */
export async function deleteTaskStatusHistory(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

