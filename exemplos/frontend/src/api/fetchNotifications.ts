import { get, getById, create, put, remove } from "./index.js";
import { NotificationDTORequest } from "./dto/index.js";

const ENDPOINT = "notifications";

/* Função para obter a lista de notificações */
export async function getNotifications(
  sort?: string,
  search?: string,
): Promise<NotificationDTORequest[]> {
  return get<NotificationDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma notificação específica por ID */
export async function getNotificationById(
  id: number,
): Promise<NotificationDTORequest | null> {
  return getById<NotificationDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova notificação */
export async function createNotification(
  notification: NotificationDTORequest,
): Promise<NotificationDTORequest | null> {
  return create<NotificationDTORequest>(ENDPOINT, notification);
}

/* Função para atualizar uma notificação existente */
export async function updateNotification(
  id: number,
  notification: NotificationDTORequest,
): Promise<NotificationDTORequest | null> {
  return put<NotificationDTORequest>(ENDPOINT, id, notification);
}

/* Função para excluir uma notificação por ID */
export async function deleteNotification(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

