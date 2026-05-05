import * as fetchTagTask from "../api/fetchTagTask.js";
import { TagTaskDTORequest } from "../api/dto/index.js";

/* Serviço para gerenciar relação tag-tarefa */
export class TagTaskService {
  /* Função para obter a lista de tags-tarefas */
  static async getTagTasks(): Promise<TagTaskDTORequest[]> {
    return await fetchTagTask.getTagTasks();
  }

  /* Função para obter uma tag-tarefa por ID */
  static async getTagTaskById(id: number): Promise<TagTaskDTORequest | null> {
    return await fetchTagTask.getTagTaskById(id);
  }

  /* Função para criar uma nova relação tag-tarefa */
  static async createTagTask(tagTask: Partial<TagTaskDTORequest>): Promise<TagTaskDTORequest | null> {
    return await fetchTagTask.createTagTask(tagTask);
  }

  /* Função para atualizar uma relação tag-tarefa existente */
  static async updateTagTask(id: number, tagTask: Partial<TagTaskDTORequest>): Promise<TagTaskDTORequest | null> {
    return await fetchTagTask.updateTagTask(id, tagTask);
  }

  /* Função para excluir uma relação tag-tarefa */
  static async deleteTagTask(id: number): Promise<boolean> {
    return await fetchTagTask.deleteTagTask(id);
  }
}
