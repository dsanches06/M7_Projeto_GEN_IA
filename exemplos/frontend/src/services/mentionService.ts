import { MentionDTORequest } from "../api/dto/index.js";
import * as fetchMentions from "../api/fetchMentions.js";

/* Serviço para gerenciar menções */
export class MentionService {
  /* Função para obter a lista de menções */
  static async getMentions(): Promise<MentionDTORequest[]> {
    return await fetchMentions.getMentions();
  }

  /* Função para obter uma menção por ID */
  static async getMentionById(id: number): Promise<MentionDTORequest | null> {
    return await fetchMentions.getMentionById(id);
  }

  /* Função para criar uma nova menção */
  static async createMention(mention: Partial<MentionDTORequest>): Promise<MentionDTORequest | null> {
    return await fetchMentions.createMention(mention);
  }

  /* Função para atualizar uma menção existente */
  static async updateMention(id: number, mention: Partial<MentionDTORequest>): Promise<MentionDTORequest | null> {
    return await fetchMentions.updateMention(id, mention);
  }

  /* Função para excluir uma menção */
  static async deleteMention(id: number): Promise<boolean> {
    return await fetchMentions.deleteMention(id);
  }
}

