import { db } from "../db.js";
import { mapChatHistoryDTOResponse } from "../dto/mapDTO.js";

export const getAllChatHistory = async () => { const [r] = await db.query("SELECT * FROM chat_history"); return r.map(mapChatHistoryDTOResponse); };
export const getChatHistoryById = async (id) => { const [r] = await db.query("SELECT * FROM chat_history WHERE id = ?", [id]); return r[0] ? mapChatHistoryDTOResponse(r[0]) : null; };
export const getChatHistoryByConversationId = async (conversationId) => {
  const [r] = await db.query("SELECT * FROM chat_history WHERE conversation_id = ? ORDER BY sent_at ASC", [conversationId]);
  return r.map(mapChatHistoryDTOResponse);
};
export const createChatHistory = async (data) => {
  const [result] = await db.query("INSERT INTO chat_history (conversation_id, role_id, content) VALUES (?, ?, ?)", [data.conversation_id, data.role_id, data.content]);
  return mapChatHistoryDTOResponse({ id: result.insertId, ...data, sent_at: new Date() });
};
export const updateChatHistory = async (id, data) => {
  const keys = Object.keys(data), vals = Object.values(data);
  const [, r] = await db.query(`UPDATE chat_history SET ${keys.map(k => k + " = ?").join(", ")} WHERE id = ?`, [...vals, id]);
  return r.affectedRows ?? 0;
};
export const deleteChatHistory = async (id) => { const [, r] = await db.query("DELETE FROM chat_history WHERE id = ?", [id]); return r.affectedRows ?? 0; };
