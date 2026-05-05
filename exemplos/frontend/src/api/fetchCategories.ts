import { get, getById, create, put, remove } from "./index.js";
import { CategoryDTORequest } from "./dto/index.js";

const ENDPOINT = "categories";

/* Função para obter a lista de categorias */
export async function getCategories(
  sort?: string,
  search?: string,
): Promise<CategoryDTORequest[]> {
  return get<CategoryDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma categoria específica por ID */
export async function getCategoryById(
  id: number,
): Promise<CategoryDTORequest | null> {
  return getById<CategoryDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova categoria */
export async function createCategory(
  category: Partial<CategoryDTORequest>,
): Promise<CategoryDTORequest | null> {
  return create<CategoryDTORequest>(ENDPOINT, category);
}

/* Função para atualizar uma categoria existente */
export async function updateCategory(
  id: number,
  category: Partial<CategoryDTORequest>,
): Promise<CategoryDTORequest | null> {
  return put<CategoryDTORequest>(ENDPOINT, id, category);
}

/* Função para excluir uma categoria por ID */
export async function deleteCategory(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}
