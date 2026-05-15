import BaseService from "../services/BaseService.js";
import Notification from "../models/Notification.js";

// Serviço de notificações — herda métodos HTTP de BaseService
class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  // Devolve notificações não lidas de um utilizador (ou globais)
  async getUnreadNotifications(userId) {
    try {
      if (userId) {
        const data = await this.fetchData(`/users/${userId}/notifications/unread`);
        return data.map(
          (n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at)
        );
      }
      const data = await this.fetchData(`/notifications`);
      return data
        .filter((n) => !n.is_read)
        .map((n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at));
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  // Devolve todas as notificações de um utilizador (ou globais)
  async getNotificationsByUser(userId) {
    try {
      const endpoint = userId ? `/users/${userId}/notifications` : `/notifications`;
      const data = await this.fetchData(endpoint);
      return data.map(
        (n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at)
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Ponto de entrada único: delega para getNotificationsByUser ou getUnreadNotifications
  async getNotifications(userId) {
    if (userId) return this.getNotificationsByUser(userId);
    return this.getUnreadNotifications();
  }

  // Devolve todas as notificações sem filtro
  async getAllNotifications() {
    try {
      const data = await this.fetchData(`/notifications`);
      return data.map(
        (n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at)
      );
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      throw error;
    }
  }

  /**
   * Marca uma notificação como lida pelo seu ID.
   * Chamado pelo NotificationItem directamente (sem userId).
   */
  async markAsRead(notificationId) {
    const res = await fetch(
      `${this.BACKEND_URL}/notifications/${notificationId}`,
      {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ is_read: true }),
      }
    );
    if (!res.ok) throw new Error(`Failed to mark as read: ${res.status}`);
    return res.json();
  }

  // Marca como lida usando PATCH (com userId) ou PUT (sem userId)
  async markNotificationAsRead(userId, notificationId) {
    try {
      const endpoint = userId
        ? `${this.BACKEND_URL}/users/${userId}/notifications/${notificationId}`
        : `${this.BACKEND_URL}/notifications/${notificationId}`;
      const response = await fetch(endpoint, {
        method:  userId ? "PATCH" : "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ is_read: true }),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Actualiza campos de uma notificação existente
  async updateNotification(notificationId, updateData) {
    try {
      const response = await fetch(
        `${this.BACKEND_URL}/notifications/${notificationId}`,
        {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(updateData),
        }
      );
      if (!response.ok) throw new Error("Failed to update notification");
      return await response.json();
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  }

  // Cria uma nova notificação e devolve instância do modelo
  async createNotification(notificationData) {
    try {
      const response = await this.sendMessage("/notifications", notificationData);
      return new Notification(
        response.id, response.title, response.message,
        response.is_read, response.sent_at
      );
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Extrai dados de notificação de um function result (tool call da IA)
  extractNotificationDataFromFunctionResult(functionResult) {
    if (!functionResult?.result) return null;
    const data = functionResult.result;
    return {
      title:   data.title,
      message: data.message,
      is_read: data.is_read || false,
      sent_at: data.sent_at || new Date().toISOString(),
      user_id: data.user_id,
    };
  }
}

// Singleton exportado para uso em toda a aplicação
export const notificationService = new NotificationService();
