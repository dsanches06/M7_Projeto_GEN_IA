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
    "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?) RETURNING id",
    [data.task_id, data.tag_id]
  );
  return mapTagTaskDTOResponse({ id: result.insertId ?? result?.[0]?.id ?? null, ...data });
};

export const createTagTasks = async (data) => {
  const task_id = Number(data.task_id);
  const tag_ids = Array.isArray(data.tag_ids)
    ? data.tag_ids.map(Number).filter((tagId) => tagId > 0)
    : [];

  if (!task_id || tag_ids.length === 0) {
    throw new Error("task_id e tag_ids são obrigatórios para adicionar etiquetas");
  }

  const inserted = [];
  for (const tagId of tag_ids) {
    const [existing] = await db.query(
      "SELECT 1 FROM tags_task WHERE task_id = ? AND tag_id = ?",
      [task_id, tagId]
    );

    if (existing.length > 0) {
      continue;
    }

    const [result] = await db.query(
      "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?) RETURNING id",
      [task_id, tagId]
    );
    inserted.push({ task_id, tag_id: tagId, id: result.insertId ?? result?.[0]?.id ?? null });
  }

  return inserted.length > 0 ? inserted : tag_ids.map((tag_id) => ({ task_id, tag_id }));
};

export const updateTagTask = async (id, data) => {
  const [result] = await db.query("UPDATE tags_task SET ? WHERE task_id = ?", [data, id]);
  return result.affectedRows;
};

export const deleteTagTask = async (id) => {
  const [result] = await db.query("DELETE FROM tags_task WHERE task_id = ?", [id]);
  return result.affectedRows;
};


