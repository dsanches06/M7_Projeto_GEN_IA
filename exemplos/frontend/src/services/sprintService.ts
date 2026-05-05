import { SprintDTORequest, SprintStatsDTORequest, SprintTaskDTORequest } from "../api/dto/typesDTO.js";
import * as fetchSprints from "../api/index.js";

/* ============================================
   SPRINTS
   ============================================ */

/* Serviço para gerenciar sprints */
export class SprintService {
  /* Função para obter a lista de sprints */
  static async getSprints(
    sort?: string,
    search?: string,
  ): Promise<SprintDTORequest[]> {
    return await fetchSprints.getSprints(sort, search);
  }

  /* Função para obter um sprint por ID */
  static async getSprintById(id: number): Promise<SprintDTORequest | null> {
    return await fetchSprints.getSprintById(id);
  }

  /* Função para criar um novo sprint */
  static async createSprint(sprint: Partial<SprintDTORequest>): Promise<SprintDTORequest | null> {
    return await fetchSprints.createSprint(sprint);
  }

  /* Função para atualizar um sprint existente */
  static async updateSprint(id: number, sprint: Partial<SprintDTORequest>): Promise<SprintDTORequest | null> {
    return await fetchSprints.updateSprint(id, sprint);
  }

  /* Função para atualizar parcialmente um sprint (datas, descrição, etc) */
  static async partialUpdateSprint(
    id: number,
    updates: Partial<SprintDTORequest>,
  ): Promise<boolean> {
    return await fetchSprints.partialUpdateSprint(id, updates);
  }

  /* Função para excluir um sprint */
  static async deleteSprint(id: number): Promise<boolean> {
    return await fetchSprints.deleteSprint(id);
  }

  /* Função para obter estatísticas globais de sprints */
  static async getSprintsStats(): Promise<SprintStatsDTORequest | null> {
    return await fetchSprints.getSprintsStats();
  }

  /* Função para obter estatísticas de um sprint */
  static async getSprintStats(id: number): Promise<SprintStatsDTORequest | null> {
    return await fetchSprints.getSprintStats(id);
  }
}

/* ============================================
   SPRINT TASKS
   ============================================ */

/* Serviço para gerenciar tarefas de sprint */
export class SprintTaskService {

  /* Função para obter a lista de tarefas de sprint (todas ou de um sprint específico) */
  static async getSprintTasks(sprintId?: number): Promise<SprintTaskDTORequest[]> {
    if (sprintId) {
      return await fetchSprints.getSprintTasks(sprintId);
    } else {
      // Obter todas as relações de sprints-tasks
      return await (fetchSprints as any).getAllSprintTasks();
    }
  }

  /* Função para obter uma tarefa de sprint por ID */
  static async getSprintTaskById(id: number): Promise<SprintTaskDTORequest | null> {
    return await fetchSprints.getSprintTaskById(id);
  }

  /* Função para criar uma nova tarefa de sprint */
  static async createSprintTask(sprintId: number, sprintTask: Partial<SprintTaskDTORequest>): Promise<SprintTaskDTORequest | null> {
    return await fetchSprints.createSprintTask(sprintId, sprintTask);
  }

  /* Função para atualizar uma tarefa de sprint existente */
  static async updateSprintTask(sprintId: number, taskId: number, sprintTask: Partial<SprintTaskDTORequest>): Promise<SprintTaskDTORequest | null> {
    return await fetchSprints.updateSprintTask(sprintId, taskId, sprintTask);
  }

  /* Função para excluir uma tarefa de sprint */
  static async deleteSprintTask(sprintId: number, taskId: number): Promise<boolean> {
    return await fetchSprints.deleteSprintTask(sprintId, taskId);
  }
}

