import { get, getById, create, put, remove } from "./index.js";
import { TaskAttachmentDTORequest } from "./dto/index.js";

const ENDPOINT = "task_attachments";

/* Função para obter a lista de anexos de tarefas */
export async function getTaskAttachments(
  sort?: string,
  search?: string,
): Promise<TaskAttachmentDTORequest[]> {
  return get<TaskAttachmentDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um anexo de tarefa por ID */
export async function getTaskAttachmentById(
  id: number,
): Promise<TaskAttachmentDTORequest | null> {
  return getById<TaskAttachmentDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo anexo de tarefa */
export async function createTaskAttachment(
  attachment: Partial<TaskAttachmentDTORequest>,
): Promise<TaskAttachmentDTORequest | null> {
  return create<TaskAttachmentDTORequest>(ENDPOINT, attachment);
}

/* Função para atualizar um anexo de tarefa */
export async function updateTaskAttachment(
  id: number,
  attachment: Partial<TaskAttachmentDTORequest>,
): Promise<TaskAttachmentDTORequest | null> {
  return put<TaskAttachmentDTORequest>(ENDPOINT, id, attachment);
}

/* Função para deletar um anexo de tarefa */
export async function deleteTaskAttachment(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

