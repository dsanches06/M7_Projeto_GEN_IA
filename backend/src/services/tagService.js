import { db } from "../db.js";
import { mapTagDTOResponse } from "../dto/mapDTO.js";

export const getAllTags = async () => { const [r] = await db.query("SELECT * FROM tags"); return r.map(mapTagDTOResponse); };
export const getTagById = async (id) => { const [r] = await db.query("SELECT * FROM tags WHERE id = ?", [id]); return r[0] ? mapTagDTOResponse(r[0]) : null; };
export const createTag = async (data) => { const [result] = await db.query("INSERT INTO tags (name) VALUES (?)", [data.name.trim()]); return mapTagDTOResponse({ id: result.insertId, name: data.name.trim() }); };
export const updateTag = async (id, data) => { const [, r] = await db.query("UPDATE tags SET name = ? WHERE id = ?", [data.name.trim(), id]); return r.affectedRows > 0 ? mapTagDTOResponse({ id, name: data.name.trim() }) : null; };
export const deleteTag = async (id) => { const [, r] = await db.query("DELETE FROM tags WHERE id = ?", [id]); return r.affectedRows; };
export const tagNameExists = async (name, excludeId = null) => {
  let q = "SELECT COUNT(*) AS cnt FROM tags WHERE name = ?"; const p = [name];
  if (excludeId) { q += " AND id != ?"; p.push(excludeId); }
  const [r] = await db.query(q, p); return parseInt(r[0]?.cnt ?? r[0]?.count ?? 0) > 0;
};
