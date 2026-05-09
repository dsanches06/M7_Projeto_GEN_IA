import { db } from "../db.js";
import { mapNotificationDTOResponse } from "../dto/mapDTO.js";

export const getAllNotifications = async () => { const [r] = await db.query("SELECT * FROM notification"); return r.map(mapNotificationDTOResponse); };
export const getNotificationById = async (id) => { const [r] = await db.query("SELECT * FROM notification WHERE id = ?", [id]); return r[0] ? mapNotificationDTOResponse(r[0]) : null; };
export const getNotificationsByUser = async (userId) => { const [r] = await db.query("SELECT * FROM notification WHERE user_id = ? ORDER BY sent_at DESC", [userId]); return r.map(mapNotificationDTOResponse); };
export const getUnreadNotifications = async (userId) => { const [r] = await db.query("SELECT * FROM notification WHERE user_id = ? AND is_read = FALSE ORDER BY sent_at DESC", [userId]); return r.map(mapNotificationDTOResponse); };
export const createNotification = async (data) => {
  const now = new Date();
  const [result] = await db.query("INSERT INTO notification (user_id, title, message, sent_at) VALUES (?, ?, ?, ?)", [data.user_id, data.title || "Notificação", data.message, now]);
  return mapNotificationDTOResponse({ id: result.insertId, ...data, sent_at: now });
};
export const updateNotification = async (id, data) => { const [, r] = await db.query("UPDATE notification SET message = ?, is_read = ? WHERE id = ?", [data.message, data.is_read, id]); return r.affectedRows ?? 0; };
export const toggleReadStatus = async (id, is_read) => { const [, r] = await db.query("UPDATE notification SET is_read = ? WHERE id = ?", [is_read, id]); return r.affectedRows ?? 0; };
export const deleteNotification = async (id) => { const [, r] = await db.query("DELETE FROM notification WHERE id = ?", [id]); return r.affectedRows ?? 0; };
export const markAsRead = async (id) => toggleReadStatus(id, true);
