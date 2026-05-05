import { TaskStatusDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTaskStatus from "../api/fetchTaskStatus.js";

/* Serviço para gerenciar status de tarefas */
export class TaskStatusService {
  /* Função para obter a lista de status de tarefas */
  static async getTaskStatuses(): Promise<TaskStatusDTORequest[]> {
    return await fetchTaskStatus.getTaskStatuses();
  }

  /* Função para obter um status de tarefa por ID */
  static async getTaskStatusById(id: number): Promise<TaskStatusDTORequest | null> {
    return await fetchTaskStatus.getTaskStatusById(id);
  }

  /* Função para criar um novo status de tarefa */
  static async createTaskStatus(status: Partial<TaskStatusDTORequest>): Promise<TaskStatusDTORequest | null> {
    return await fetchTaskStatus.createTaskStatus(status);
  }

  /* Função para atualizar um status de tarefa existente */
  static async updateTaskStatus(id: number, status: Partial<TaskStatusDTORequest>): Promise<TaskStatusDTORequest | null> {
    return await fetchTaskStatus.updateTaskStatus(id, status);
  }

  /* Função para excluir um status de tarefa */
  static async deleteTaskStatus(id: number): Promise<boolean> {
    return await fetchTaskStatus.deleteTaskStatus(id);
  }
}
