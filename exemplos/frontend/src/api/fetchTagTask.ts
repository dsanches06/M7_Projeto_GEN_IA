import { get, getById, create, put, remove } from "./index.js";
import { TagTaskDTORequest } from "./dto/index.js";

const ENDPOINT = "tags_task";

/* Função para obter a lista de relações de tags em tarefas */
export async function getTagTasks(sort?: string, search?: string): Promise<TagTaskDTORequest[]> {
  return get<TagTaskDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma relação de tag em tarefa por ID */
export async function getTagTaskById(id: number): Promise<TagTaskDTORequest | null> {
  return getById<TagTaskDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova relação de tag em tarefa */
export async function createTagTask(tagTask: Partial<TagTaskDTORequest>): Promise<TagTaskDTORequest | null> {
  return create<TagTaskDTORequest>(ENDPOINT, tagTask);
}

/* Função para atualizar uma relação de tag em tarefa */
export async function updateTagTask(id: number, tagTask: Partial<TagTaskDTORequest>): Promise<TagTaskDTORequest | null> {
  return put<TagTaskDTORequest>(ENDPOINT, id, tagTask);
}

/* Função para deletar uma relação de tag em tarefa */
export async function deleteTagTask(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

