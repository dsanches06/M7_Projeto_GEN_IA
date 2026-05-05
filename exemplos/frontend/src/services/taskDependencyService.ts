import { TaskDependencyDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTaskDependencies from "../api/fetchTaskDependencies.js";

/* Serviço para gerenciar dependências de tarefas */
export class TaskDependencyService {
  /* Função para obter a lista de dependências de tarefas */
  static async getTaskDependencies(): Promise<TaskDependencyDTORequest[]> {
    return await fetchTaskDependencies.getTaskDependencies();
  }

  /* Função para obter uma dependência de tarefa por ID */
  static async getTaskDependencyById(id: number): Promise<TaskDependencyDTORequest | null> {
    return await fetchTaskDependencies.getTaskDependencyById(id);
  }

  /* Função para criar uma nova dependência de tarefa */
  static async createTaskDependency(dependency: TaskDependencyDTORequest): Promise<TaskDependencyDTORequest | null> {
    return await fetchTaskDependencies.createTaskDependency(dependency);
  }

  /* Função para atualizar uma dependência de tarefa existente */
  static async updateTaskDependency(id: number, dependency: TaskDependencyDTORequest): Promise<TaskDependencyDTORequest | null> {
    return await fetchTaskDependencies.updateTaskDependency(id, dependency);
  }

  /* Função para excluir uma dependência de tarefa */
  static async deleteTaskDependency(id: number): Promise<boolean> {
    return await fetchTaskDependencies.deleteTaskDependency(id);
  }
}
