import { get, getById, create, put, remove, request } from "./index.js";
import { TaskAssigneeDTORequest } from "./dto/index.js";

const ENDPOINT = "task_assignees";

/* Função para obter a lista de atribuíções de tarefas */
export async function getTaskAssignees(
  sort?: string,
  search?: string,
): Promise<TaskAssigneeDTORequest[]> {
  return get<TaskAssigneeDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma atribuição de tarefa por ID */
export async function getTaskAssigneeById(
  id: number,
): Promise<TaskAssigneeDTORequest | null> {
  return getById<TaskAssigneeDTORequest>(ENDPOINT, id);
}

/* Função para obter atribuições de tarefas de um utilizador */
export async function getTaskAssigneesByUserId(
  userId: number,
): Promise<TaskAssigneeDTORequest[]> {
  const data = await request<TaskAssigneeDTORequest[]>(`${ENDPOINT}/${userId}`);
  return Array.isArray(data) ? data : [];
}

/* Função para criar uma nova atribuição de tarefa */
export async function createTaskAssignee(
  assignee: Partial<TaskAssigneeDTORequest>,
): Promise<TaskAssigneeDTORequest | null> {
  return create<TaskAssigneeDTORequest>(ENDPOINT, assignee);
}

/* Função para atualizar uma atribuição de tarefa */
export async function updateTaskAssignee(
  id: number,
  assignee: Partial<TaskAssigneeDTORequest>,
): Promise<TaskAssigneeDTORequest | null> {
  return put<TaskAssigneeDTORequest>(ENDPOINT, id, assignee);
}

/* Função para deletar uma atribuição de tarefa */
export async function deleteTaskAssignee(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

