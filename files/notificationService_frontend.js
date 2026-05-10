import BaseService from "../services/BaseService.js";
import Notification from "../models/Notification.js";

class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getUnreadNotifications(userId) {
    try {
      if (userId) {
        const data = await this.fetchData(`/users/${userId}/notifications/unread`);
        return data.map((n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at));
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

  async getNotificationsByUser(userId) {
    try {
      const endpoint = userId ? `/users/${userId}/notifications` : `/notifications`;
      const data = await this.fetchData(endpoint);
      return data.map((n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getNotifications(userId) {
    if (userId) return this.getNotificationsByUser(userId);
    return this.getUnreadNotifications();
  }

  async getAllNotifications() {
    try {
      const data = await this.fetchData(`/notifications`);
      return data.map((n) => new Notification(n.id, n.title, n.message, n.is_read, n.sent_at));
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      throw error;
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  async createNotification(notificationData) {
    try {
      const response = await this.sendMessage("/notifications", notificationData);
      return new Notification(
        response.id, response.title, response.message, response.is_read, response.sent_at
      );
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Mark a single notification as read.
   * Uses the dynamic backend PATCH/PUT — only sends is_read, preserving message.
   */
  async markAsRead(notificationId) {
    try {
      const res = await fetch(`${this.BACKEND_URL}/notifications/${notificationId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ is_read: true }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** User-scoped mark as read (PATCH /users/:userId/notifications/:notificationId) */
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

  async updateNotification(notificationId, updateData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/notifications/${notificationId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update notification");
      return await response.json();
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  extractNotificationDataFromFunctionResult(functionResult) {
    if (!functionResult?.result) return null;
    const { title, message, is_read, sent_at, user_id } = functionResult.result;
    return { title, message, is_read: is_read || false, sent_at: sent_at || new Date().toISOString(), user_id };
  }
}

export const notificationService = new NotificationService();
