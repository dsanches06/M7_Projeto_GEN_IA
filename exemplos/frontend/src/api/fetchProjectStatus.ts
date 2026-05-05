import { get, getById, create, put, remove } from "./index.js";
import { ProjectStatusDTORequest } from "./dto/index.js";

const ENDPOINT = "project_status";

/* Função para obter a lista de status de projeto */
export async function getProjectStatuses(
  sort?: string,
  search?: string,
): Promise<ProjectStatusDTORequest[]> {
  return get<ProjectStatusDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um status de projeto por ID */
export async function getProjectStatusById(
  id: number,
): Promise<ProjectStatusDTORequest | null> {
  return getById<ProjectStatusDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo status de projeto */
export async function createProjectStatus(
  status: Partial<ProjectStatusDTORequest>,
): Promise<ProjectStatusDTORequest | null> {
  return create<ProjectStatusDTORequest>(ENDPOINT, status);
}

/* Função para atualizar um status de projeto */
export async function updateProjectStatus(
  id: number,
  status: Partial<ProjectStatusDTORequest>,
): Promise<ProjectStatusDTORequest | null> {
  return put<ProjectStatusDTORequest>(ENDPOINT, id, status);
}

/* Função para deletar um status de projeto */
export async function deleteProjectStatus(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

