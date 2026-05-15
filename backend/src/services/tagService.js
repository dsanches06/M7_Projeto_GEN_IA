import { db } from "../db.js";
import { mapTagDTOResponse } from "../dto/mapDTO.js";

// Devolve todas as etiquetas mapeadas para DTO
export const getAllTags = async () => { const [r] = await db.query("SELECT * FROM tags"); return r.map(mapTagDTOResponse); };
// Devolve uma etiqueta pelo ID ou null se não existir
export const getTagById = async (id) => { const [r] = await db.query("SELECT * FROM tags WHERE id = ?", [id]); return r[0] ? mapTagDTOResponse(r[0]) : null; };
// Insere uma nova etiqueta com o nome normalizado (trim)
export const createTag = async (data) => { const [result] = await db.query("INSERT INTO tags (name) VALUES (?)", [data.name.trim()]); return mapTagDTOResponse({ id: result.insertId, name: data.name.trim() }); };
// Actualiza o nome da etiqueta; devolve o DTO ou null se não encontrado
export const updateTag = async (id, data) => { const [, r] = await db.query("UPDATE tags SET name = ? WHERE id = ?", [data.name.trim(), id]); return r.affectedRows > 0 ? mapTagDTOResponse({ id, name: data.name.trim() }) : null; };
// Elimina uma etiqueta e devolve o número de linhas afectadas
export const deleteTag = async (id) => { const [, r] = await db.query("DELETE FROM tags WHERE id = ?", [id]); return r.affectedRows; };
// Verifica duplicados de nome; pode excluir um ID específico (para edições)
export const tagNameExists = async (name, excludeId = null) => {
  let q = "SELECT COUNT(*) AS cnt FROM tags WHERE name = ?"; const p = [name];
  if (excludeId) { q += " AND id != ?"; p.push(excludeId); }
  const [r] = await db.query(q, p); return parseInt(r[0]?.cnt ?? r[0]?.count ?? 0) > 0;
};
