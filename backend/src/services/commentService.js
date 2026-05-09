import { db } from "../db.js";
import { mapTaskCommentDTOResponse } from "../dto/mapDTO.js";
import * as taskService from "./taskService.js";
import * as userService from "./userService.js";

export const getCommentsByTaskId = async (taskId) => { const [r] = await db.query("SELECT * FROM comment WHERE task_id = ? ORDER BY created_at DESC", [taskId]); return r.map(mapTaskCommentDTOResponse); };
export const createComment = async (taskId, data) => {
  const task = await taskService.getTaskById(taskId); if (!task) throw new Error("Task not found");
  const user = await userService.getUserById(Number(data.userId)); if (!user) throw new Error("User not found");
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [result] = await db.query("INSERT INTO comment (task_id, user_id, content, created_at) VALUES (?, ?, ?, ?)", [taskId, data.userId, data.content.trim(), now]);
  return mapTaskCommentDTOResponse({ id: result.insertId, task_id: taskId, user_id: data.userId, content: data.content.trim(), created_at: now });
};
export const deleteComment = async (id) => { const [, r] = await db.query("DELETE FROM comment WHERE id = ?", [id]); return r.affectedRows; };
export const resolveComment = async (id, resolved) => {
  const [, r] = await db.query("UPDATE comment SET resolved = ? WHERE id = ?", [resolved ? 1 : 0, id]);
  if (r.affectedRows === 0) throw new Error("Comentário não encontrado");
  const [u] = await db.query("SELECT * FROM comment WHERE id = ?", [id]); return u[0];
};
export const updateComment = async (id, content) => {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [, r] = await db.query("UPDATE comment SET content = ?, edited_at = ? WHERE id = ?", [content, now, id]);
  if (r.affectedRows === 0) throw new Error("Comentário não encontrado");
  const [u] = await db.query("SELECT * FROM comment WHERE id = ?", [id]); return u[0];
};
export const getAllComments = async () => { const [r] = await db.query("SELECT content FROM comment ORDER BY created_at DESC"); return r.map(c => c.content); };
