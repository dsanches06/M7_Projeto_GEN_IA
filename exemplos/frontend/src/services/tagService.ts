import * as fetchTags from "../api/fetchTags.js";

/* Serviço para gerenciar tags */
export class TagService {
  /* Função para obter a lista de tags */
  static async getTags(): Promise<any[]> {
    return await fetchTags.getTags();
  }

  /* Função para obter uma tag por ID */
  static async getTagById(id: number): Promise<any | null> {
    return await fetchTags.getTagById(id);
  }

  /* Função para obter tarefas associadas a uma tag */
  static async getTagTasks(id: number): Promise<any[]> {
    return await fetchTags.getTasksByTag(id);
  }

  /* Função para criar uma nova tag */
  static async createTag(tag: any): Promise<any | null> {
    return await fetchTags.createTag(tag);
  }

  /* Função para atualizar uma tag existente */
  static async updateTag(id: number, tag: any): Promise<any | null> {
    return await fetchTags.updateTag(id, tag);
  }

  /* Função para excluir uma tag */
  static async deleteTag(id: number): Promise<boolean> {
    return await fetchTags.deleteTag(id);
  }
}
