import { get, getById, create, put, remove } from "./index.js";
import { FavoriteTaskDTORequest } from "./dto/index.js";

const ENDPOINT = "favorite_tasks";

/* Função para obter a lista de tarefas favoritas */
export async function getFavoriteTasks(
  sort?: string,
  search?: string,
): Promise<FavoriteTaskDTORequest[]> {
  return get<FavoriteTaskDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma tarefa favorita por ID */
export async function getFavoriteTaskById(
  id: number,
): Promise<FavoriteTaskDTORequest | null> {
  return getById<FavoriteTaskDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova tarefa favorita */
export async function createFavoriteTask(
  favoriteTask: Partial<FavoriteTaskDTORequest>,
): Promise<FavoriteTaskDTORequest | null> {
  return create<FavoriteTaskDTORequest>(ENDPOINT, favoriteTask);
}

/* Função para atualizar uma tarefa favorita */
export async function updateFavoriteTask(
  id: number,
  favoriteTask: Partial<FavoriteTaskDTORequest>,
): Promise<FavoriteTaskDTORequest | null> {
  return put<FavoriteTaskDTORequest>(ENDPOINT, id, favoriteTask);
}

/* Função para deletar uma tarefa favorita */
export async function deleteFavoriteTask(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

