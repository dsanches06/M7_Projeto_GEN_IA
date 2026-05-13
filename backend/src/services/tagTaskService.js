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

// ── createTagTask ─────────────────────────────────────────────────────────────
// NOTE: tags_task has NO id column (composite PK: task_id + tag_id).
// RETURNING id is removed — it caused PostgreSQL errors.
export const createTagTask = async (data) => {
  await db.query(
    "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)",
    [data.task_id, data.tag_id]
  );
  return mapTagTaskDTOResponse({ task_id: data.task_id, tag_id: data.tag_id });
};

// ── createTagTasks (bulk, skips duplicates) ───────────────────────────────────
export const createTagTasks = async (data) => {
  const task_id = Number(data.task_id);
  const tag_ids = Array.isArray(data.tag_ids)
    ? data.tag_ids.map(Number).filter((n) => n > 0)
    : [];

  if (!task_id || task_id <= 0)
    throw new Error(`task_id inválido: ${data.task_id}`);
  if (tag_ids.length === 0)
    throw new Error("tag_ids deve conter pelo menos um ID válido");

  const [taskRows] = await db.query("SELECT id FROM task WHERE id = ?", [task_id]);
  if (!Array.isArray(taskRows) || taskRows.length === 0)
    throw new Error(`Tarefa ${task_id} não encontrada.`);

  const inserted  = [];
  const skipped   = [];

  for (const tagId of tag_ids) {
    const [tagRows] = await db.query("SELECT id FROM tags WHERE id = ?", [tagId]);
    if (!Array.isArray(tagRows) || tagRows.length === 0) {
      skipped.push(tagId);
      continue;
    }

    // Check duplicate
    const [existing] = await db.query(
      "SELECT 1 FROM tags_task WHERE task_id = ? AND tag_id = ?",
      [task_id, tagId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      skipped.push(tagId);
      continue;
    }

    // No RETURNING — tags_task has no id column
    await db.query(
      "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)",
      [task_id, tagId]
    );
    inserted.push({ task_id, tag_id: tagId });
  }

  if (inserted.length === 0)
    throw new Error("Nenhuma etiqueta foi adicionada (todas já existem ou são inválidas).");

  // Return inserted rows (or, if all skipped, return them anyway so controller can build response)
  return inserted;
};

export const updateTagTask = async (id, data) => {
  const [result] = await db.query("UPDATE tags_task SET ? WHERE task_id = ?", [data, id]);
  return result.affectedRows;
};

export const deleteTagTask = async (id) => {
  const [result] = await db.query("DELETE FROM tags_task WHERE task_id = ?", [id]);
  return result.affectedRows;
};
