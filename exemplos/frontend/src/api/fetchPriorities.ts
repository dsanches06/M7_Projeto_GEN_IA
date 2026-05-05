import { get, getById, create, put, remove } from "./index.js";
import { PriorityDTORequest } from "./dto/index.js";

const ENDPOINT = "priorities";

/* Função para obter todos as prioridades  */
export async function getPriorities(
  sort?: string,
  search?: string,
): Promise<PriorityDTORequest[]> {
  return get<PriorityDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma prioridade pelo id */
export async function getPriorityById(
  id: number,
): Promise<PriorityDTORequest | null> {
  return getById<PriorityDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova prioridade  */
export async function createPriority(
  priority: Partial<PriorityDTORequest>,
): Promise<PriorityDTORequest | null> {
  return create<PriorityDTORequest>(ENDPOINT, priority);
}

/* Função para editar ou atualizar os dados de uma prioridade  */
export async function updatePriority(
  id: number,
  priority: Partial<PriorityDTORequest>,
): Promise<PriorityDTORequest | null> {
  return put<PriorityDTORequest>(ENDPOINT, id, priority);
}

/* Função para deletar uma prioridade */
export async function deletePriority(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

