import { db } from "../db.js";
import { mapPriorityDTOResponse } from "../dto/mapDTO.js";

// Devolve todas as prioridades mapeadas para DTO
export const getAllPriorities = async () => {
  const [priorities] = await db.query("SELECT * FROM priorities");
  return priorities.map(mapPriorityDTOResponse);
};

// Devolve uma prioridade pelo ID ou null se não existir
export const getPriorityById = async (priorityId) => {
  const [priorities] = await db.query("SELECT * FROM priorities WHERE id = ?", [priorityId]);
  return priorities.length > 0 ? mapPriorityDTOResponse(priorities[0]) : null;
};

// Insere uma nova prioridade; flow_order assume 0 por omissão
export const createPriority = async (data) => {
  const [result] = await db.query(
    "INSERT INTO priorities (name, flow_order) VALUES (?, ?)",
    [data.name, data.flow_order ?? 0]
  );
  return mapPriorityDTOResponse({ id: result.insertId, ...data });
};

// Actualiza todos os campos fornecidos de uma prioridade
export const updatePriority = async (id, data) => {
  const [result] = await db.query("UPDATE priorities SET ? WHERE id = ?", [data, id]);
  return result.affectedRows;
};

// Elimina uma prioridade pelo ID
export const deletePriority = async (id) => {
  const [result] = await db.query("DELETE FROM priorities WHERE id = ?", [id]);
  return result.affectedRows;
};


