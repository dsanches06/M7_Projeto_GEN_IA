import { get, getById, create, put, remove } from "./index.js";
import { ProjectPermissionDTORequest } from "./dto/index.js";

const ENDPOINT = "project_permissions";

/* Função para obter a lista de permissões de projeto */
export async function getProjectPermissions(
  sort?: string,
  search?: string,
): Promise<ProjectPermissionDTORequest[]> {
  return get<ProjectPermissionDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma permissão de projeto por ID */
export async function getProjectPermissionById(
  id: number,
): Promise<ProjectPermissionDTORequest | null> {
  return getById<ProjectPermissionDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova permissão de projeto */
export async function createProjectPermission(
  permission: Partial<ProjectPermissionDTORequest>,
): Promise<ProjectPermissionDTORequest | null> {
  return create<ProjectPermissionDTORequest>(ENDPOINT, permission);
}

/* Função para atualizar uma permissão de projeto */
export async function updateProjectPermission(
  id: number,
  permission: Partial<ProjectPermissionDTORequest>,
): Promise<ProjectPermissionDTORequest | null> {
  return put<ProjectPermissionDTORequest>(ENDPOINT, id, permission);
}

/* Função para deletar uma permissão de projeto */
export async function deleteProjectPermission(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

