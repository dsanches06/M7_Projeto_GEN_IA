import { UserStatsDTORequest } from "../api/dto/index.js";
import { IUser, UserClass } from "../models/index.js";
import Notifications from "../notifications/Notifications.js";
import {
  apiCreateUser,
  apiGetNotificationsByUser,
  apiGetUnreadNotifications,
  apiGetUserById,
  apiGetUsers,
  apiGetUserStats,
  apiMarkNotificationAsRead,
  apiToggleUserActive,
  apiUpdateUser,
  apiDeleteUser,
} from "../api/index.js";

/* Serviço para gerenciar usuários */
export class UserService {
  /* Função para obter a lista de usuários */
  static async getUsers(sort?: string, search?: string): Promise<IUser[]> {
    return await apiGetUsers(sort, search);
  }

  /* Função para obter um usuário por ID da API */
  static async getUserById(id: number): Promise<IUser | null> {
    return await apiGetUserById(id);
  }

  /* Função para obter estatísticas de usuário */
  static async getUserStats(): Promise<UserStatsDTORequest | null> {
    return await apiGetUserStats();
  }

  /* Função para obter notificações não lidas do usuário */
  static async getUnreadNotifications(
    userId: number,
  ): Promise<Notifications[]> {
    return await apiGetUnreadNotifications(userId);
  }

  /* Função para obter todas as notificações do usuário */
  static async getNotificationsByUser(
    userId: number,
  ): Promise<Notifications[]> {
    return await apiGetNotificationsByUser(userId);
  }

  /* Função para criar um novo usuário */
  static async createUser(userData: any): Promise<IUser | null> {
    return await apiCreateUser(userData);
  }

  /* Função para atualizar um usuário */
  static async updateUser(
    userId: number,
    userData: any,
  ): Promise<IUser | null> {
    return await apiUpdateUser(userId, userData);
  }

  /* Função para alternar ativo/inativo do usuário */
  static async toggleUserActive(
    userId: number,
    active: boolean,
  ): Promise<IUser | null> {
    return await apiToggleUserActive(userId, active);
  }

  /* Função para marcar notificação como lida */
  static async markNotificationAsRead(
    userId: number,
    notificationId: number,
  ): Promise<any> {
    return await apiMarkNotificationAsRead(userId, notificationId);
  }

  /* Função para deletar um usuário */
  static async deleteUser(userId: number): Promise<boolean> {
    return await apiDeleteUser(userId);
  }
}

