import { db } from "../db.js";
import { mapTaskDTOResponse, mapTaskStatsDTOResponse } from "../dto/mapDTO.js";

const pn = (v, fb = 0) => { const n = Number(v); return (v == null || v === "" || isNaN(n)) ? fb : n; };
const toD = (v) => { try { const d = new Date(v); return isNaN(d) ? null : d.toISOString().slice(0,19).replace("T"," "); } catch { return null; } };

export const getAllTasks = async (search, sort) => {
  let q = "SELECT t.*, ta.user_id AS assigned_to FROM task t LEFT JOIN task_assignees ta ON t.id = ta.task_id"; const p = [];
  if (search) { q += " WHERE (t.title LIKE ? OR t.description LIKE ?)"; p.push(`%${search}%`, `%${search}%`); }
  if (sort === "asc" || sort === "desc") q += ` ORDER BY t.title ${sort.toUpperCase()}`;
  const [rows] = await db.query(q, p); return rows.map(mapTaskDTOResponse);
};
export const createTask = async (data) => {
  const d = {
    title: (data.title ?? "").toString().trim(),
    description: (data.description ?? "").toString().trim(),
    status_id: pn(data.status_id ?? data.statusId, 1),
    priority_id: pn(data.priority_id ?? data.priorityId, 1),
    estimated_hours: pn(data.estimated_hours ?? data.estimatedHours, 0),
    due_date: toD(data.due_date ?? data.dueDate),
    completed_at: toD(data.completed_at ?? data.completedAt),
    created_at: toD(data.created_at ?? data.createdAt),
  };

  const columns = ["title", "description", "status_id", "priority_id", "estimated_hours", "due_date", "completed_at"];
  const values = [d.title, d.description, d.status_id, d.priority_id, d.estimated_hours, d.due_date, d.completed_at];

  if (d.created_at) {
    columns.push("created_at");
    values.push(d.created_at);
  }

  const placeholders = columns.map(() => "?").join(", ");
  const [result] = await db.query(
    `INSERT INTO task (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`,
    values,
  );

  return mapTaskDTOResponse({ id: result.insertId ?? result?.[0]?.id ?? null, ...d });
};

export const updateStatus = async (taskId, data) => { const [, r] = await db.query("UPDATE task SET status_id = ? WHERE id = ?", [data.status_id, taskId]); return r.affectedRows; };

export const updateTask = async (taskId, data) => {
  const fields = [], values = [], add = (c, v) => { fields.push(`${c} = ?`); values.push(v); };
  if (data.title !== undefined) add("title", data.title);
  if (data.description !== undefined) add("description", data.description);
  if (data.status_id !== undefined) add("status_id", data.status_id);
  if (data.priority_id !== undefined) add("priority_id", data.priority_id);
  if (data.estimated_hours !== undefined) add("estimated_hours", data.estimated_hours);
  if (data.due_date !== undefined) add("due_date", data.due_date);
  if (data.completed_at !== undefined) add("completed_at", data.completed_at);
  if (!fields.length) return 0;
  values.push(taskId);
  const [, r] = await db.query(`UPDATE task SET ${fields.join(", ")} WHERE id = ?`, values);
  return r.affectedRows;
};
export const deleteTask = async (taskId) => { const [, r] = await db.query("DELETE FROM task WHERE id = ?", [taskId]); return r.affectedRows; };
export const getTaskById = async (taskId) => {
  const [rows] = await db.query("SELECT t.*, ta.user_id AS assigned_to FROM task t LEFT JOIN task_assignees ta ON t.id = ta.task_id WHERE t.id = ?", [taskId]);
  return rows[0] ? mapTaskDTOResponse(rows[0]) : null;
};
export const addTagToTask = async (taskId, tagId) => {
  if (!taskId || taskId <= 0) throw new Error(`Tarefa ID inválida: ${taskId}`);
  if (!tagId || tagId <= 0) throw new Error(`Etiqueta ID inválida: ${tagId}`);
  const task = await getTaskById(taskId); if (!task) throw new Error(`Tarefa ${taskId} não encontrada`);
  const [ex] = await db.query("SELECT * FROM tags_task WHERE task_id = ? AND tag_id = ?", [taskId, tagId]);
  if (ex?.length > 0) throw new Error("Etiqueta já associada");
  const [r] = await db.query("INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?) RETURNING id", [taskId, tagId]);
  return { taskId, tagId, relationId: r.insertId ?? r?.[0]?.id ?? null };
};
export const removeTagFromTask = async (taskId, tagId) => { const [, r] = await db.query("DELETE FROM tags_task WHERE task_id = ? AND tag_id = ?", [taskId, tagId]); return r.affectedRows; };
export const getTagsByTaskId = async (taskId) => { const [r] = await db.query("SELECT * FROM tags_task WHERE task_id = ?", [taskId]); return r; };
export const getTasksByTagId = async (tagId) => { const [r] = await db.query("SELECT t.* FROM task t INNER JOIN tags_task tt ON t.id = tt.task_id WHERE tt.tag_id = ?", [tagId]); return r.map(mapTaskDTOResponse); };
export const removeTagFromAllTasks = async (tagId) => { const [, r] = await db.query("DELETE FROM tags_task WHERE tag_id = ?", [tagId]); return r.affectedRows; };
export const removeTicketFromAllTasks = async () => 0;
export const removeConversationFromAllTasks = async () => 0;
export const getTaskStats = async () => {
  const [r1] = await db.query("SELECT COUNT(*) AS total FROM task");
  const total = parseInt(r1[0]?.total ?? r1[0]?.count ?? 0);
  const [r2] = await db.query("SELECT COUNT(*) AS completed FROM task WHERE completed_at IS NOT NULL");
  const completed = parseInt(r2[0]?.completed ?? r2[0]?.count ?? 0);
  const pct = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
  return mapTaskStatsDTOResponse({ totalTasks: total, completedTasks: completed, pendingTasks: total - completed, completedPercentage: pct + "%" });
};
