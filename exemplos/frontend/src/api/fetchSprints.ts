import { get, getById, create, put, patch, remove, request } from "./index.js";
import { SprintDTORequest, SprintStatsDTORequest, SprintTaskDTORequest } from "./dto/index.js";

const ENDPOINT = "sprints";

/* ============================================
   SPRINTS
   ============================================ */

/* Função para obter a lista de sprints */
export async function getSprints(
  sort?: string,
  search?: string,
): Promise<SprintDTORequest[]> {
  return get<SprintDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um sprint por ID */
export async function getSprintById(
  id: number,
): Promise<SprintDTORequest | null> {
  return getById<SprintDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo sprint */
export async function createSprint(
  sprint: Partial<SprintDTORequest>,
): Promise<SprintDTORequest | null> {
  return create<SprintDTORequest>(ENDPOINT, sprint);
}

/* Função para atualizar um sprint */
export async function updateSprint(
  id: number,
  sprint: Partial<SprintDTORequest>,
): Promise<SprintDTORequest | null> {
  return put<SprintDTORequest>(ENDPOINT, id, sprint);
}

/* Função para atualizar parcialmente um sprint (datas, descrição, etc) */
export async function partialUpdateSprint(
  id: number,
  updates: Partial<SprintDTORequest>,
): Promise<boolean> {
  const result = await patch<SprintDTORequest>(ENDPOINT, id, updates);
  return result !== null;
}

/* Função para deletar um sprint */
export async function deleteSprint(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

/* Função para obter estatísticas globais de sprints */
export async function getSprintsStats(): Promise<SprintStatsDTORequest | null> {
  const stats = await get<SprintStatsDTORequest>(ENDPOINT + "/stats");
  return stats ? stats[0] || null : null;
}

/* Função para obter estatísticas de um sprint */
export async function getSprintStats(id: number): Promise<SprintStatsDTORequest | null> {
  const stats = await get<SprintStatsDTORequest>(ENDPOINT + `/${id}/stats`);
  return stats ? stats[0] || null : null;
}

/* ============================================
   SPRINT TASKS
   ============================================ */

/* Função para obter a lista de tarefas de um sprint */
export async function getSprintTasks(
  sprintId: number,
  sort?: string,
  search?: string,
): Promise<SprintTaskDTORequest[]> {
  return get<SprintTaskDTORequest>(`${ENDPOINT}/${sprintId}/tasks`, sort, search);
}

/* Função para obter TODAS as relações de sprints-tasks */
export async function getAllSprintTasks(
  sort?: string,
  search?: string,
): Promise<SprintTaskDTORequest[]> {
  return get<SprintTaskDTORequest>(`${ENDPOINT}/tasks`, sort, search);
}

/* Função para obter uma tarefa de sprint por ID */
export async function getSprintTaskById(
  taskId: number,
): Promise<SprintTaskDTORequest | null> {
  return getById<SprintTaskDTORequest>(`${ENDPOINT}/tasks`, taskId);
}

/* Função para criar uma nova tarefa de sprint */
export async function createSprintTask(
  sprintId: number,
  sprintTask: Partial<SprintTaskDTORequest>,
): Promise<SprintTaskDTORequest | null> {
  return create<SprintTaskDTORequest>(`${ENDPOINT}/${sprintId}/tasks`, sprintTask);
}

/* Função para atualizar uma tarefa de sprint */
export async function updateSprintTask(
  sprintId: number,
  taskId: number,
  sprintTask: Partial<SprintTaskDTORequest>,
): Promise<SprintTaskDTORequest | null> {
  return put<SprintTaskDTORequest>(`${ENDPOINT}/${sprintId}/tasks`, taskId, sprintTask);
}

/* Função para deletar uma tarefa de sprint */
export async function deleteSprintTask(sprintId: number, taskId: number): Promise<boolean> {
  const result = await request(
    `${ENDPOINT}/${sprintId}/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );
  return result !== null;
}

