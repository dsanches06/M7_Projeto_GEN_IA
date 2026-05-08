import BaseService from "./BaseService.js";
import Notification from "../models/Notification.js";

/**
 * NotificationService - Serviço de Notificações
 * Herda de BaseService para reutilizar lógica de streaming e comunicação
 */
class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  /**
   * Busca notificações não lidas de um usuário
   */
  async getUnreadNotifications(userId) {
    try {
      const data = await this.fetchData(
        `/users/${userId}/notifications/unread`,
      );
      return data.map(
        (notif) =>
          new Notification(
            notif.id,
            notif.title,
            notif.message,
            notif.is_read,
            notif.sent_at,
          ),
      );
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  /**
   * Busca todas as notificações de um usuário
   */
  async getNotificationsByUser(userId) {
    try {
      const data = await this.fetchData(`/users/${userId}/notifications`);
      return data.map(
        (notif) =>
          new Notification(
            notif.id,
            notif.title,
            notif.message,
            notif.is_read,
            notif.sent_at,
          ),
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Envia mensagem para criar notificação com streaming
   */
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    userId = null,
  ) {
    const payload = {
      message,
      conversationHistory,
      userId,
    };
    return this.sendStreamMessage(
      "/notifications/message/stream",
      payload,
      onChunk,
      onDone,
    );
  }

  /**
   * Marca notificação como lida
   */
  async markNotificationAsRead(userId, notificationId) {
    try {
      const response = await fetch(
        `${this.BACKEND_URL}/users/${userId}/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_read: true }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Cria notificação
   */
  async createNotification(notificationData) {
    try {
      const response = await this.sendMessage("/notifications", notificationData);
      return new Notification(
        response.id,
        response.title,
        response.message,
        response.is_read,
        response.sent_at,
      );
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Extrai dados de notificação do function result
   */
  extractNotificationDataFromFunctionResult(functionResult) {
    if (!functionResult || !functionResult.result) {
      return null;
    }

    const data = functionResult.result;
    return {
      title: data.title,
      message: data.message,
      is_read: data.is_read || false,
      sent_at: data.sent_at || new Date().toISOString(),
      user_id: data.user_id,
    };
  }
}

// Exporta instância singleton
export const notificationService = new NotificationService();