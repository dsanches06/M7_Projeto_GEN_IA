import { db } from "../db.js";
import { mapConversationDTOResponse } from "../dto/mapDTO.js";

export const getAllConversations = async () => {
  const [rows] = await db.query("SELECT * FROM conversations");
  return rows.map(mapConversationDTOResponse);
};
export const getConversationById = async (id) => {
  const [rows] = await db.query("SELECT * FROM conversations WHERE id = ?", [id]);
  return rows[0] ? mapConversationDTOResponse(rows[0]) : null;
};
export const createConversation = async (data) => {
  const [result] = await db.query("INSERT INTO conversations (title) VALUES (?)", [data.title]);
  return mapConversationDTOResponse({ id: result.insertId, title: data.title, created_at: new Date() });
};
export const updateConversation = async (id, data) => {
  const keys = Object.keys(data), vals = Object.values(data);
  const [, r] = await db.query(`UPDATE conversations SET ${keys.map(k => `${k} = ?`).join(", ")} WHERE id = ?`, [...vals, id]);
  return r.affectedRows ?? 0;
};
export const deleteConversation = async (id) => {
  const [, r] = await db.query("DELETE FROM conversations WHERE id = ?", [id]);
  return r.affectedRows ?? 0;
};
