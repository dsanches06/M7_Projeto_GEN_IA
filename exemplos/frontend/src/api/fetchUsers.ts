import { get, getById, create, put, patch, remove, request } from "./index.js";
import { IUser, UserClass } from "../models/index.js";
import Notifications from "../notifications/Notifications.js";
import {
  mapToUserClass,
  mapToNotifications,
  UserDTORequest,
  NotificationDTORequest,
  UserStatsDTORequest,
} from "./dto/index.js";

const ENDPOINT = "users";

/* Função para obter a lista de utilizadores */
export async function apiGetUsers(
  sort?: string,
  search?: string,
): Promise<IUser[]> {
  const data = await get<UserDTORequest>(ENDPOINT, sort, search);
  return data.map(mapToUserClass);
}

/* Função para obter um utilizador por ID */
export async function apiGetUserById(id: number): Promise<IUser | null> {
  const data = await getById<UserDTORequest>(ENDPOINT, id);
  return data ? mapToUserClass(data) : null;
}

/* Função para obter estatísticas de utilizadores */
export async function apiGetUserStats(): Promise<UserStatsDTORequest | null> {
  const stats = await request<UserStatsDTORequest>(`${ENDPOINT}/stats`);
  return stats || null;
}

/* Função para obter notificações não lidas do utilizador */
export async function apiGetUnreadNotifications(
  userId: number,
): Promise<Notifications[]> {
  const data = await request<NotificationDTORequest[]>(
    `${ENDPOINT}/${userId}/notifications/unread`,
  );
  if (!data) return [];
  const notifications = Array.isArray(data)
    ? data.map(mapToNotifications)
    : [mapToNotifications(data)];
  return notifications;
}

/* Função para obter todas as notificações do utilizador */
export async function apiGetNotificationsByUser(
  userId: number,
): Promise<Notifications[]> {
  const data = await request<NotificationDTORequest[]>(
    `${ENDPOINT}/${userId}/notifications`,
  );
  if (!data) return [];
  const notifications = Array.isArray(data)
    ? data.map(mapToNotifications)
    : [mapToNotifications(data)];
  return notifications;
}

/* ======================== POST ======================== */

/* Função para criar um novo utilizador */
export async function apiCreateUser(
  userData: Partial<UserDTORequest>,
): Promise<IUser | null> {
  const data = await create<UserDTORequest>(ENDPOINT, userData);
  return data ? mapToUserClass(data) : null;
}

/* Função para atualizar um utilizador */
export async function apiUpdateUser(
  userId: number,
  userData: Partial<UserDTORequest>,
): Promise<IUser | null> {
  const data = await put<UserDTORequest>(ENDPOINT, userId, userData);
  return data ? mapToUserClass(data) : null;
}

/* Função para ativar/desativar um utilizador */
export async function apiToggleUserActive(
  userId: number,
  active: boolean,
): Promise<IUser | null> {
  const data = await patch<UserDTORequest>(ENDPOINT, userId, {
    active: active ? 1 : 0,
  });
  return data ? mapToUserClass(data) : null;
}

/* Função para marcar uma notificação como lida */
export async function apiMarkNotificationAsRead(
  userId: number,
  notificationId: number,
): Promise<NotificationDTORequest | null> {
  return request<NotificationDTORequest>(
    `${ENDPOINT}/${userId}/notifications/${notificationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

/* Função para deletar um utilizador */
export async function apiDeleteUser(userId: number): Promise<boolean> {
  return remove(ENDPOINT, userId);
}

