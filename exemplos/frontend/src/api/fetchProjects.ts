import { get, getById, create, put, patch, remove } from "./index.js";
import { Project } from "../projects/index.js";
import { mapToProject, ProjectDTORequest, ProjectStatsDTORequest } from "./dto/index.js";

const ENDPOINT = "projects";

/* Função para obter a lista de projetos */
export async function getProjects(
  sort?: string,
  search?: string,
): Promise<Project[]> {
  const data = await get<ProjectDTORequest>(ENDPOINT, sort, search);
  return data.map((item: any) => mapToProject(item));
}

/* Função para obter um projeto específico por ID */
export async function getProjectById(id: number): Promise<Project | null> {
  const data = await getById<ProjectDTORequest>(ENDPOINT, id);
  return data ? mapToProject(data) : null;
}

/* Função para criar um novo projeto */
export async function createProject(
  project: ProjectDTORequest,
): Promise<Project | null> {
  const data = await create<ProjectDTORequest>(ENDPOINT, project);
  return data ? mapToProject(data) : null;
}

/* Função para atualizar um projeto existente */
export async function updateProject(
  project: ProjectDTORequest,
): Promise<Project | null> {
  const data = await put<ProjectDTORequest>(ENDPOINT, project.id, project);
  return data ? mapToProject(data) : null;
}

/* Função para atualizar parcialmente um projeto (datas, descrição, etc) */
export async function partialUpdateProject(
  id: number,
  updates: Partial<ProjectDTORequest>,
): Promise<boolean> {
  const result = await patch<ProjectDTORequest>(ENDPOINT, id, updates);
  return result !== null;
}

/* Função para excluir um projeto por ID */
export async function deleteProject(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

/* Função para obter estatísticas globais de projetos */
export async function getProjectsStats(): Promise<ProjectStatsDTORequest | null> {
  const stats = await get<ProjectStatsDTORequest>(ENDPOINT + "/stats");
  return stats ? stats[0] || null : null;
}

/* Função para obter estatísticas de um projeto */
export async function getProjectStats(id: number): Promise<ProjectStatsDTORequest | null> {
  const stats = await get<ProjectStatsDTORequest>(ENDPOINT + `/${id}/stats`);
  return stats ? stats[0] || null : null;
}

