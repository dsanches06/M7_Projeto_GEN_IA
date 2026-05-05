import * as fetchProjects from "../api/fetchProjects.js";
import * as fetchProjectStatus from "../api/fetchProjectStatus.js";
import { IProject, Project } from "../projects/index.js";
import { ProjectDTORequest, ProjectStatusDTORequest, ProjectStatsDTORequest } from "../api/dto/index.js";

/* Serviço para gerenciar projetos */
export class ProjectService {
  /* Função para obter a lista de projetos */
  static async getProjects(
    sort?: string,
    search?: string,
  ): Promise<Project[]> {
    return await fetchProjects.getProjects(sort, search);
  }

  /* Função para obter um projeto por ID */
  static async getProjectById(id: number): Promise<Project | null> {
    return await fetchProjects.getProjectById(id);
  }

  /* Função para criar um novo projeto */
  static async createProject(project: ProjectDTORequest): Promise<Project | null> {
    return await fetchProjects.createProject(project);
  }

  /* Função para atualizar um projeto existente */
  static async updateProject(project: ProjectDTORequest): Promise<Project | null> {
    return await fetchProjects.updateProject(project);
  }

  /* Função para atualizar parcialmente um projeto (datas, descrição, etc) */
  static async partialUpdateProject(
    id: number,
    updates: Partial<ProjectDTORequest>,
  ): Promise<boolean> {
    return await fetchProjects.partialUpdateProject(id, updates);
  }

  /* Função para excluir um projeto */
  static async deleteProject(id: number): Promise<boolean> {
    return await fetchProjects.deleteProject(id);
  }

  /* Função para obter os status disponíveis dos projetos */
  static async getProjectStatuses(): Promise<ProjectStatusDTORequest[]> {
    return await fetchProjectStatus.getProjectStatuses();
  }

  /* Função para obter estatísticas globais de projetos */
  static async getProjectsStats(): Promise<ProjectStatsDTORequest | null> {
    return await fetchProjects.getProjectsStats();
  }

  /* Função para obter estatísticas de um projeto */
  static async getProjectStats(id: number): Promise<ProjectStatsDTORequest | null> {
    return await fetchProjects.getProjectStats(id);
  }
}

