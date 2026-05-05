import { TaskAssigneeDTORequest } from "../api/dto/index.js";
import * as fetchTaskAssignees from "../api/fetchTaskAssignees.js";

/* Serviço para gerenciar atribuições de tarefas */
export class TaskAssigneeService {
  /* Função para obter a lista de atribuições de tarefas */
  static async getTaskAssignees(): Promise<TaskAssigneeDTORequest[]> {
    return await fetchTaskAssignees.getTaskAssignees();
  }

  /* Função para obter uma atribuição de tarefa por ID */
  static async getTaskAssigneeById(id: number): Promise<TaskAssigneeDTORequest | null> {
    return await fetchTaskAssignees.getTaskAssigneeById(id);
  }

  /* Função para obter atribuições de tarefas de um utilizador */
  static async getTaskAssigneesByUserId(userId: number): Promise<TaskAssigneeDTORequest[]> {
    return await fetchTaskAssignees.getTaskAssigneesByUserId(userId);
  }

  /* Função para criar uma nova atribuição de tarefa */
  static async createTaskAssignee(assignee: Partial<TaskAssigneeDTORequest>): Promise<TaskAssigneeDTORequest | null> {
    return await fetchTaskAssignees.createTaskAssignee(assignee);
  }

  /* Função para atualizar uma atribuição de tarefa existente */
  static async updateTaskAssignee(id: number, assignee: TaskAssigneeDTORequest): Promise<TaskAssigneeDTORequest | null> {
    return await fetchTaskAssignees.updateTaskAssignee(id, assignee);
  }

  /* Função para excluir uma atribuição de tarefa */
  static async deleteTaskAssignee(id: number): Promise<boolean> {
    return await fetchTaskAssignees.deleteTaskAssignee(id);
  }
}

