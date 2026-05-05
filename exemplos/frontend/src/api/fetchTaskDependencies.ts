import { get, getById, create, put, remove } from "./index.js";
import { TaskDependencyDTORequest } from "./dto/index.js";

const ENDPOINT = "task_dependencies";

/* Função para obter a lista de dependências de tarefas */
export async function getTaskDependencies(
  sort?: string,
  search?: string,
): Promise<TaskDependencyDTORequest[]> {
  return get<TaskDependencyDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma dependência de tarefa por ID */
export async function getTaskDependencyById(
  id: number,
): Promise<TaskDependencyDTORequest | null> {
  return getById<TaskDependencyDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova dependência de tarefa */
export async function createTaskDependency(
  dependency: Partial<TaskDependencyDTORequest>,
): Promise<TaskDependencyDTORequest | null> {
  return create<TaskDependencyDTORequest>(ENDPOINT, dependency);
}

/* Função para atualizar uma dependência de tarefa */
export async function updateTaskDependency(
  id: number,
  dependency: Partial<TaskDependencyDTORequest>,
): Promise<TaskDependencyDTORequest | null> {
  return put<TaskDependencyDTORequest>(ENDPOINT, id, dependency);
}

/* Função para deletar uma dependência de tarefa */
export async function deleteTaskDependency(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

