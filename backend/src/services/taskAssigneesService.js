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
  const [existing] = await db.query(
    "SELECT * FROM task_assignees WHERE task_id = ?",
    [data.task_id]
  );

  if (Array.isArray(existing) && existing.length > 0)
    throw new Error("Esta tarefa já está atribuída a outro utilizador.");

  // Insert without RETURNING (no id column in this junction table)
  await db.query(
    "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)",
    [data.task_id, data.user_id]
  );

  return mapTaskAssigneeDTOResponse({ task_id: data.task_id, user_id: data.user_id, assigned_at: new Date() });
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
