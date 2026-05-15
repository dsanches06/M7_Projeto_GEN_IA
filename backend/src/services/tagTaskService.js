import { db } from "../db.js";
import { mapTagTaskDTOResponse } from "../dto/mapDTO.js";

// Devolve todas as associações tarefa-etiqueta
export const getAllTagTasks = async () => {
  const [tagTasks] = await db.query("SELECT * FROM tags_task");
  return tagTasks.map(mapTagTaskDTOResponse);
};

// Devolve a primeira associação para um task_id
export const getTagTaskById = async (tagTaskId) => {
  const [tagTasks] = await db.query("SELECT * FROM tags_task WHERE task_id = ?", [tagTaskId]);
  return tagTasks.length > 0 ? mapTagTaskDTOResponse(tagTasks[0]) : null;
};

// Cria uma associação simples tarefa-etiqueta (PK composta: task_id + tag_id, sem coluna id)
export const createTagTask = async (data) => {
  await db.query(
    "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)",
    [data.task_id, data.tag_id]
  );
  return mapTagTaskDTOResponse({ task_id: data.task_id, tag_id: data.tag_id });
};

// Inserção em massa de etiquetas numa tarefa; ignora duplicados silenciosamente
export const createTagTasks = async (data) => {
  const task_id = Number(data.task_id);
  // Filtra IDs inválidos ou não numéricos
  const tag_ids = Array.isArray(data.tag_ids)
    ? data.tag_ids.map(Number).filter((n) => n > 0)
    : [];

  if (!task_id || task_id <= 0)
    throw new Error(`task_id inválido: ${data.task_id}`);
  if (tag_ids.length === 0)
    throw new Error("tag_ids deve conter pelo menos um ID válido");

  // Garante que a tarefa existe antes de inserir
  const [taskRows] = await db.query("SELECT id FROM task WHERE id = ?", [task_id]);
  if (!Array.isArray(taskRows) || taskRows.length === 0)
    throw new Error(`Tarefa ${task_id} não encontrada.`);

  const inserted  = []; // Etiquetas inseridas com sucesso
  const skipped   = []; // Etiquetas ignoradas (inválidas ou duplicadas)

  for (const tagId of tag_ids) {
    const [tagRows] = await db.query("SELECT id FROM tags WHERE id = ?", [tagId]);
    if (!Array.isArray(tagRows) || tagRows.length === 0) {
      skipped.push(tagId);
      continue;
    }

    // Verifica se a associação já existe (evita duplicado na PK composta)
    const [existing] = await db.query(
      "SELECT 1 FROM tags_task WHERE task_id = ? AND tag_id = ?",
      [task_id, tagId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      skipped.push(tagId);
      continue;
    }

    // Sem RETURNING — tags_task não tem coluna id
    await db.query(
      "INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)",
      [task_id, tagId]
    );
    inserted.push({ task_id, tag_id: tagId });
  }

  if (inserted.length === 0)
    throw new Error("Nenhuma etiqueta foi adicionada (todas já existem ou são inválidas).");

  return inserted;
};

// Actualiza os dados de uma associação pelo task_id
export const updateTagTask = async (id, data) => {
  const [result] = await db.query("UPDATE tags_task SET ? WHERE task_id = ?", [data, id]);
  return result.affectedRows;
};

// Elimina todas as associações de um task_id
export const deleteTagTask = async (id) => {
  const [result] = await db.query("DELETE FROM tags_task WHERE task_id = ?", [id]);
  return result.affectedRows;
};
