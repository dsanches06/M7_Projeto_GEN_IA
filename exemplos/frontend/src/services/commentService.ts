import { TaskCommentDTORequest } from "../api/dto/index.js";
import * as fetchTasks from "../api/fetchTasks.js";

/* Serviço para gerir comentários associados a tarefas */
export class CommentService {
  /* Obtém comentários de uma tarefa da API */
  static async getTaskComments(taskId: number): Promise<TaskCommentDTORequest[]> {
    return await fetchTasks.getTaskComments(taskId);
  }

  /* Cria um comentário em uma tarefa na API */
  static async createTaskComment(
    taskId: number,
    commentData: TaskCommentDTORequest,
  ): Promise<TaskCommentDTORequest | null> {
    return await fetchTasks.createTaskComment(taskId, commentData);
  }

  /* Atualiza um comentário na API */
  static async updateTaskComment(
    taskId: number,
    commentId: number,
    commentData: TaskCommentDTORequest,
  ): Promise<TaskCommentDTORequest | null> {
    return await fetchTasks.updateTaskComment(taskId, commentId, commentData);
  }
}

