import { db } from "../db.js";
import { mapTaskAssigneeDTOResponse } from "../dto/mapDTO.js";

export const getAllTaskAssignees = async () => {
  const [assignees] = await db.query("SELECT * FROM task_assignees");
  return assignees.map(mapTaskAssigneeDTOResponse);
};

export const getTaskAssigneeByUserId = async (userId) => {
  const [assignees] = await db.query("SELECT * FROM task_assignees WHERE user_id = ?", [userId]);
  return assignees.map(mapTaskAssigneeDTOResponse);
};

// ── createTaskAssignee ────────────────────────────────────────────────────────
// NOTE: task_assignees has NO separate id column (composite PK: task_id + user_id).
// RETURNING id removed — caused PostgreSQL "column id does not exist" errors.
export const createTaskAssignee = async (data) => {
  const taskId = Number(data.task_id);
  const userId = Number(data.user_id);

  if (!taskId || taskId <= 0)
    throw new Error(`task_id inválido: ${data.task_id}`);
  if (!userId || userId <= 0)
    throw new Error(`user_id inválido: ${data.user_id}`);

  const [taskRows] = await db.query("SELECT id FROM task WHERE id = ?", [taskId]);
  if (!Array.isArray(taskRows) || taskRows.length === 0)
    throw new Error(`Tarefa ${taskId} não encontrada.`);

  const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
  if (!Array.isArray(userRows) || userRows.length === 0)
    throw new Error(`Utilizador ${userId} não encontrado.`);

  const [existing] = await db.query(
    "SELECT * FROM task_assignees WHERE task_id = ?",
    [taskId]
  );

  if (Array.isArray(existing) && existing.length > 0)
    throw new Error("Esta tarefa já está atribuída a outro utilizador.");

  await db.query(
    "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)",
    [taskId, userId]
  );

  return mapTaskAssigneeDTOResponse({ task_id: taskId, user_id: userId, assigned_at: new Date() });
};

// ── deleteTaskAssignee ────────────────────────────────────────────────────────
// Deletes by task_id (not a separate row id — the table uses composite PK).
export const deleteTaskAssignee = async (taskId) => {
  const [result] = await db.query("DELETE FROM task_assignees WHERE task_id = ?", [taskId]);
  return result.affectedRows ?? 0;
};

export const updateTaskAssignee = async (taskId, data) => {
  const [result] = await db.query("UPDATE task_assignees SET ? WHERE task_id = ?", [data, taskId]);
  return result.affectedRows;
};
