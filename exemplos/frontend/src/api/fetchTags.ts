import { get, getById, create, put, remove, request } from "./index.js";
import { TaskDTORequest, TagDTORequest } from "./dto/index.js";

const ENDPOINT = "tags";

/* Função para obter a lista de tags */
export async function getTags(
  sort?: string,
  search?: string,
): Promise<TagDTORequest[]> {
  return get<TagDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma tag por ID */
export async function getTagById(id: number): Promise<TagDTORequest | null> {
  return getById<TagDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova tag */
export async function createTag(
  tag: Partial<TagDTORequest>,
): Promise<TagDTORequest | null> {
  return create<TagDTORequest>(ENDPOINT, tag);
}

/* Função para atualizar uma tag */
export async function updateTag(
  id: number,
  tag: Partial<TagDTORequest>,
): Promise<TagDTORequest | null> {
  return put<TagDTORequest>(ENDPOINT, id, tag);
}

/* Função para deletar uma tag */
export async function deleteTag(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

export async function getTasksByTag(tagId: number): Promise<TaskDTORequest[]> {
  const data = await request<TaskDTORequest[]>(`${ENDPOINT}/${tagId}/tasks`);
  return data ?? [];
}

