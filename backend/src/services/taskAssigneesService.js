import { db } from "../db.js";
import { mapTaskAssigneeDTOResponse } from "../dto/mapDTO.js";
import * as taskService from "./taskService.js";
import * as notificationService from "./notificationService.js";
import * as userService from "./userService.js";

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
  const taskId = Number(data.task_id ?? data.taskId);
  const userId = Number(data.user_id ?? data.userId);

  if (!taskId || taskId <= 0)
    throw new Error(`task_id inválido: ${data.task_id ?? data.taskId}`);
  if (!userId || userId <= 0)
    throw new Error(`user_id inválido: ${data.user_id ?? data.userId}`);

  const [taskRows] = await db.query("SELECT id, status_id FROM task WHERE id = ?", [taskId]);
  if (!Array.isArray(taskRows) || taskRows.length === 0)
    throw new Error(`Tarefa ${taskId} não encontrada.`);

  const previousStatusId = taskRows[0].status_id;

  const user = await userService.getUserById(userId);
  if (!user)
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

  try {
    await taskService.updateStatus(taskId, { status_id: 2 });
  } catch (err) {
    await db.query("DELETE FROM task_assignees WHERE task_id = ? AND user_id = ?", [taskId, userId]);
    throw err;
  }

  const notificationPayload = {
    user_id: userId,
    title: data.notification_title || data.title || "Tarefa atribuída",
    message:
      data.notification_message ||
      data.message ||
      `A tarefa ${taskId} foi atribuída a ${user.name}.`,
  };

  const assignment = mapTaskAssigneeDTOResponse({ task_id: taskId, user_id: userId, assigned_at: new Date() });
  const notification = await notificationService.createNotification(notificationPayload);

  return {
    ...assignment,
    notification,
  };
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
