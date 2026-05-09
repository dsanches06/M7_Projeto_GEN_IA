import { db } from "../db.js";
import { mapSummaryDTOResponse } from "../dto/mapDTO.js";
export const getAllSummaries = async () => { const [r] = await db.query("SELECT * FROM summaries"); return r.map(mapSummaryDTOResponse); };
export const getSummaryById = async (id) => { const [r] = await db.query("SELECT * FROM summaries WHERE id = ?", [id]); return r[0] ? mapSummaryDTOResponse(r[0]) : null; };
export const getSummaryByConversationId = async (conversationId) => { const [r] = await db.query("SELECT * FROM summaries WHERE conversation_id = ?", [conversationId]); return r[0] ? mapSummaryDTOResponse(r[0]) : null; };
export const createSummary = async (data) => {
  const [result] = await db.query("INSERT INTO summaries (conversation_id, original_text, summary) VALUES (?, ?, ?)", [data.conversation_id, data.original_text, data.summary ?? null]);
  return mapSummaryDTOResponse({ id: result.insertId, ...data });
};
export const updateSummary = async (id, data) => { const f = Object.keys(data).map(k => k + " = ?").join(", "); const [, r] = await db.query(`UPDATE summaries SET ${f} WHERE id = ?`, [...Object.values(data), id]); return r.affectedRows; };
export const deleteSummary = async (id) => { const [, r] = await db.query("DELETE FROM summaries WHERE id = ?", [id]); return r.affectedRows; };
