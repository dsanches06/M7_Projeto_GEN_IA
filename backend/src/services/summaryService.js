import { db } from "../db.js";
import { mapSummaryDTOResponse } from "../dto/mapDTO.js";

export const getAllSummaries = async () => {
  const [r] = await db.query("SELECT * FROM summaries");
  return r.map(mapSummaryDTOResponse);
};

export const getSummaryById = async (id) => {
  const [r] = await db.query("SELECT * FROM summaries WHERE id = ?", [id]);
  return r[0] ? mapSummaryDTOResponse(r[0]) : null;
};

export const getSummaryByConversationId = async (conversationId) => {
  const [r] = await db.query(
    "SELECT * FROM summaries WHERE conversation_id = ?",
    [conversationId]
  );
  return r[0] ? mapSummaryDTOResponse(r[0]) : null;
};

export const createSummary = async (data) => {
  const [result] = await db.query(
    "INSERT INTO summaries (conversation_id, original_text, summary) VALUES (?, ?, ?)",
    [
      data.conversation_id,
      (data.original_text ?? "").substring(0, 295),
      (data.summary ?? "").substring(0, 195),
    ]
  );
  return mapSummaryDTOResponse({ id: result.insertId, ...data });
};

/**
 * Upsert summary — atualiza se já existir para a conversa, cria caso contrário.
 * Garante que cada conversa tem sempre um resumo atualizado.
 */
export const upsertSummary = async (data) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM summaries WHERE conversation_id = ?",
      [data.conversation_id]
    );

    const originalText = (data.original_text ?? "").substring(0, 295);
    const summaryText = (data.summary ?? "").substring(0, 195);

    if (rows && rows.length > 0) {
      // Atualiza o resumo existente
      await db.query(
        "UPDATE summaries SET original_text = ?, summary = ? WHERE conversation_id = ?",
        [originalText, summaryText, data.conversation_id]
      );
      return mapSummaryDTOResponse({
        id: rows[0].id,
        conversation_id: data.conversation_id,
        original_text: originalText,
        summary: summaryText,
      });
    } else {
      // Cria novo resumo
      return createSummary({
        conversation_id: data.conversation_id,
        original_text: originalText,
        summary: summaryText,
      });
    }
  } catch (err) {
    console.error("[upsertSummary] Error:", err.message);
    throw err;
  }
};

export const updateSummary = async (id, data) => {
  const f = Object.keys(data)
    .map((k) => k + " = ?")
    .join(", ");
  const [, r] = await db.query(
    `UPDATE summaries SET ${f} WHERE id = ?`,
    [...Object.values(data), id]
  );
  return r.affectedRows;
};

export const deleteSummary = async (id) => {
  const [, r] = await db.query("DELETE FROM summaries WHERE id = ?", [id]);
  return r.affectedRows;
};
