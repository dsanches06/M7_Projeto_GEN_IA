import { TaskAttachmentDTORequest } from "../api/dto/index.js";
import * as fetchTaskAttachments from "../api/fetchTaskAttachments.js";
import { Attachment } from "../attachments/index.js";

/* Serviço para gerir anexos associados a tarefas */
export class AttachmentService {
  /* Obtém a lista de anexos de tarefas da API */
  static async getTaskAttachments(): Promise<TaskAttachmentDTORequest[]> {
    return await fetchTaskAttachments.getTaskAttachments();
  }

  /* Obtém um anexo de tarefa por ID da API */
  static async getTaskAttachmentById(id: number): Promise<TaskAttachmentDTORequest | null> {
    return await fetchTaskAttachments.getTaskAttachmentById(id);
  }

  /* Cria um novo anexo de tarefa na API */
  static async createTaskAttachment(attachment: Partial<TaskAttachmentDTORequest>): Promise<TaskAttachmentDTORequest | null> {
    return await fetchTaskAttachments.createTaskAttachment(attachment);
  }

  /* Atualiza um anexo de tarefa na API */
  static async updateTaskAttachment(
    id: number,
    attachment: Partial<TaskAttachmentDTORequest>,
  ): Promise<TaskAttachmentDTORequest | null> {
    return await fetchTaskAttachments.updateTaskAttachment(id, attachment);
  }

  /* Exclui um anexo de tarefa na API */
  static async deleteTaskAttachment(id: number): Promise<boolean> {
    return await fetchTaskAttachments.deleteTaskAttachment(id);
  }
}

