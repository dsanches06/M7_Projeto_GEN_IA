import { TaskVoteDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTaskVotes from "../api/fetchTaskVotes.js";

/* Serviço para gerenciar votos de tarefas */
export class TaskVoteService {
  /* Função para obter a lista de votos de tarefas */
  static async getTaskVotes(): Promise<TaskVoteDTORequest[]> {
    return await fetchTaskVotes.getTaskVotes();
  }

  /* Função para obter um voto de tarefa por ID */
  static async getTaskVoteById(id: number): Promise<TaskVoteDTORequest | null> {
    return await fetchTaskVotes.getTaskVoteById(id);
  }

  /* Função para criar um novo voto de tarefa */
  static async createTaskVote(vote: TaskVoteDTORequest): Promise<TaskVoteDTORequest | null> {
    return await fetchTaskVotes.createTaskVote(vote);
  }

  /* Função para atualizar um voto de tarefa existente */
  static async updateTaskVote(id: number, vote: TaskVoteDTORequest): Promise<TaskVoteDTORequest | null> {
    return await fetchTaskVotes.updateTaskVote(id, vote);
  }

  /* Função para excluir um voto de tarefa */
  static async deleteTaskVote(id: number): Promise<boolean> {
    return await fetchTaskVotes.deleteTaskVote(id);
  }
}
