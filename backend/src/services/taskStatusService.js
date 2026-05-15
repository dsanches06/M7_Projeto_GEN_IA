import { db } from "../db.js";
import { mapTaskStatusDTOResponse } from "../dto/mapDTO.js";

// Devolve todos os estados de tarefa mapeados para DTO
export const getAllTaskStatuses = async () => {
  const [statuses] = await db.query("SELECT * FROM task_status");
  return statuses.map(mapTaskStatusDTOResponse);
};
// Devolve um estado de tarefa pelo ID ou null se não existir
export const getTaskStatusById = async (taskStatusId) => {
  const [taskStatuses] = await db.query(
    "SELECT * FROM task_status WHERE id = ?",
    [taskStatusId],
  );
  return taskStatuses.length > 0
    ? mapTaskStatusDTOResponse(taskStatuses[0])
    : null;
};
// Insere um novo estado; flow_order assume 0 por omissão
export const createTaskStatus = async (data) => {
  const [result] = await db.query(
    "INSERT INTO task_status (name, flow_order) VALUES (?, ?)",
    [data.name, data.flow_order ?? 0],
  );
  return mapTaskStatusDTOResponse({ id: result.insertId, ...data });
};

// Actualiza todos os campos fornecidos de um estado de tarefa
export const updateTaskStatus = async (id, data) => {
  const [result] = await db.query("UPDATE task_status SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result.affectedRows;
};

// Elimina um estado de tarefa e devolve o número de linhas afectadas
export const deleteTaskStatus = async (id) => {
  const [result] = await db.query("DELETE FROM task_status WHERE id = ?", [id]);
  return result.affectedRows;
};
