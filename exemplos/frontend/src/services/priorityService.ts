import { PriorityDTORequest } from "../api/dto/index.js";
import * as fetchPriorities from "../api/fetchPriorities.js";

/* Serviço para gerenciar prioridades */
export class PriorityService {
  /* Função para obter a lista de prioridades */
  static async getPriorities(): Promise<PriorityDTORequest[]> {
    return await fetchPriorities.getPriorities();
  }

  /* Função para obter uma prioridade por ID */
  static async getPriorityById(id: number): Promise<PriorityDTORequest | null> {
    return await fetchPriorities.getPriorityById(id);
  }

  /* Função para criar uma nova prioridade */
  static async createPriority(priority: Partial<PriorityDTORequest>): Promise<PriorityDTORequest | null> {
    return await fetchPriorities.createPriority(priority);
  }

  /* Função para atualizar uma prioridade existente */
  static async updatePriority(id: number, priority: Partial<PriorityDTORequest>): Promise<PriorityDTORequest | null> {
    return await fetchPriorities.updatePriority(id, priority);
  }

  /* Função para excluir uma prioridade */
  static async deletePriority(id: number): Promise<boolean> {
    return await fetchPriorities.deletePriority(id);
  }
}

