import { db } from "../db.js";
import { mapNotificationDTOResponse } from "../dto/mapDTO.js";

/* Função para buscar todas as notificações */
export const getAllNotifications = async () => {
  const [notifications] = await db.query("SELECT * FROM notification");
  return notifications.map(mapNotificationDTOResponse);
};

/* Função para buscar notificação por ID */
export const getNotificationById = async (notificationId) => {
  const [notifications] = await db.query(
    "SELECT * FROM notification WHERE id = $1",
    [notificationId],
  );
  return notifications[0] ? mapNotificationDTOResponse(notifications[0]) : null;
};

/* Função para buscar notificações por ID do usuário */
export const getNotificationsByUser = async (userId) => {
  const [notifications] = await db.query(
    "SELECT * FROM notification WHERE user_id = $1 ORDER BY sent_at DESC",
    [userId],
  );
  return notifications.map(mapNotificationDTOResponse);
};

/* Função para buscar notificações não lidas de um usuário */
export const getUnreadNotifications = async (userId) => {
  const [notifications] = await db.query(
    "SELECT * FROM notification WHERE user_id = $1 AND is_read = FALSE ORDER BY sent_at DESC",
    [userId],
  );
  return notifications.map(mapNotificationDTOResponse);
};

/* Função para criar notificação */
export const createNotification = async (data) => {
  const now = new Date();
  const postgresDateTime = now.toISOString().slice(0, 19).replace("T", " ");

  const [result] = await db.query(
    "INSERT INTO notification (user_id, title, message, sent_at) VALUES ($1, $2, $3, $4) RETURNING id",
    [
      data.user_id,
      data.title || "Notificação",
      data.message,
      postgresDateTime,
    ],
  );
  return mapNotificationDTOResponse({ id: result.rows[0].id, ...data, sent_at: postgresDateTime });
};

/* Função para atualizar notificação */
export const updateNotification = async (notificationId, data) => {
  const { message, is_read } = data;
  const [result] = await db.query(
    "UPDATE notification SET message = $1, is_read = $2 WHERE id = $3",
    [message, is_read, notificationId],
  );

  return result.rowCount || 0;
};

export const toggleReadStatus = async (notificationId, is_read) => {
  const [result] = await db.query(
    "UPDATE notification SET is_read = $1 WHERE id = $2",
    [is_read, notificationId],
  );
  return result.rowCount || 0;
};

/* Função para deletar notificação */
export const deleteNotification = async (notificationId) => {
  const [result] = await db.query("DELETE FROM notification WHERE id = $1", [
    notificationId,
  ]);
  return result.rowCount || 0;
};

/* Função para marcar notificação como lida */
export const markAsRead = async (notificationId) => {
  return await toggleReadStatus(notificationId, true);
};


