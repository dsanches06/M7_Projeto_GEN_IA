import { db } from "../db.js";
import { mapNotificationDTOResponse } from "../dto/mapDTO.js";

export const getAllNotifications = async () => {
  const [r] = await db.query("SELECT * FROM notification");
  return r.map(mapNotificationDTOResponse);
};

export const getNotificationById = async (id) => {
  const [r] = await db.query("SELECT * FROM notification WHERE id = ?", [id]);
  return r[0] ? mapNotificationDTOResponse(r[0]) : null;
};

export const getNotificationsByUser = async (userId) => {
  const [r] = await db.query(
    "SELECT * FROM notification WHERE user_id = ? ORDER BY sent_at DESC",
    [userId]
  );
  return r.map(mapNotificationDTOResponse);
};

export const getUnreadNotifications = async (userId) => {
  const [r] = await db.query(
    "SELECT * FROM notification WHERE user_id = ? AND is_read = FALSE ORDER BY sent_at DESC",
    [userId]
  );
  return r.map(mapNotificationDTOResponse);
};

export const createNotification = async (data) => {
  const now = new Date();
  const [result] = await db.query(
    "INSERT INTO notification (user_id, title, message, sent_at) VALUES (?, ?, ?, ?)",
    [data.user_id, data.title || "Notificação", data.message, now]
  );
  return mapNotificationDTOResponse({ id: result.insertId, ...data, sent_at: now });
};

/**
 * Atualização dinâmica — só actualiza os campos presentes em `data`.
 * Evita que chamar markAsRead coloque message = NULL.
 */
export const updateNotification = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.message  !== undefined) { fields.push("message = ?");  values.push(data.message); }
  if (data.is_read  !== undefined) { fields.push("is_read = ?");  values.push(data.is_read); }
  if (data.title    !== undefined) { fields.push("title = ?");    values.push(data.title); }

  if (fields.length === 0) return 0;

  values.push(id);
  const [, r] = await db.query(
    `UPDATE notification SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return r.affectedRows ?? 0;
};

export const toggleReadStatus = async (id, is_read) => {
  const [, r] = await db.query(
    "UPDATE notification SET is_read = ? WHERE id = ?",
    [is_read, id]
  );
  return r.affectedRows ?? 0;
};

export const deleteNotification = async (id) => {
  const [, r] = await db.query("DELETE FROM notification WHERE id = ?", [id]);
  return r.affectedRows ?? 0;
};

export const markAsRead = async (id) => toggleReadStatus(id, true);
