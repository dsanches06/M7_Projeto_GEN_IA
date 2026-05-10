import { db } from "../db.js";
import { mapTagTaskDTOResponse } from "../dto/mapDTO.js";

export const getAllTagTasks = async () => {
  const [tagTasks] = await db.query("SELECT * FROM tags_task");
  return tagTasks.map(mapTagTaskDTOResponse);
};

export const getTagTaskById = async (tagTaskId) => {
  const [tagTasks] = await db.query("SELECT * FROM tags_task WHERE task_id = ?", [tagTaskId]);
  return tagTasks.length > 0 ? mapTagTaskDTOResponse(tagTasks[0]) : null;
};

export const createTagTask = async (data) => {
  const [result] = await db.query(
    "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)",
    [data.task_id, data.tag_id]
  );
  return mapTagTaskDTOResponse({ id: result.insertId, ...data });
};

export const createTagTasks = async (data) => {
  const task_id = Number(data.task_id);
  const tag_ids = Array.isArray(data.tag_ids)
    ? data.tag_ids.map(Number).filter((tagId) => tagId > 0)
    : [];

  if (!task_id || tag_ids.length === 0) {
    throw new Error("task_id e tag_ids são obrigatórios para adicionar etiquetas");
  }

  const values = tag_ids.map((tagId) => [task_id, tagId]);
  await db.query(
    "INSERT IGNORE INTO tags_task (task_id, tag_id) VALUES ?",
    [values]
  );

  return tag_ids.map((tagId) => ({ task_id, tag_id: tagId }));
};

export const updateTagTask = async (id, data) => {
  const [result] = await db.query("UPDATE tags_task SET ? WHERE task_id = ?", [data, id]);
  return result.affectedRows;
};

export const deleteTagTask = async (id) => {
  const [result] = await db.query("DELETE FROM tags_task WHERE task_id = ?", [id]);
  return result.affectedRows;
};


