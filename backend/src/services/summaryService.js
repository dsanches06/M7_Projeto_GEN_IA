import { db } from "../db.js";
import { mapSummaryDTOResponse } from "../dto/mapDTO.js";

// Função para buscar todos os resumos
export const getAllSummaries = async () => {
  const [summaries] = await db.query("SELECT * FROM summaries");
  return summaries.map(mapSummaryDTOResponse);
};

// Busca resumo por ID
export const getSummaryById = async (summaryId) => {
  const [summaries] = await db.query("SELECT * FROM summaries WHERE id = ?", [
    summaryId,
  ]);
  return summaries[0] ? mapSummaryDTOResponse(summaries[0]) : null;
};

// Busca resumo por ID da conversa
export const getSummaryByConversationId = async (conversationId) => {
  const [summaries] = await db.query("SELECT * FROM summaries WHERE conversation_id = ?", [
    conversationId,
  ]);
  return summaries[0] ? mapSummaryDTOResponse(summaries[0]) : null;
};

// Cria um novo resumo
export const createSummary = async (data) => {
  const [result] = await db.query(
    "INSERT INTO summaries (conversation_id, original_text, summary) VALUES (?, ?, ?)",
    [data.conversation_id, data.original_text, data.summary],
  );
  return mapSummaryDTOResponse({
    id: result.insertId,
    ...data,
  });
};

export const updateSummary = async (id, data) => {
  const [result] = await db.query("UPDATE summaries SET ? WHERE id = ?", [
    data,
    id,
  ]);
  return result.affectedRows;
};

export const deleteSummary = async (id) => {
  const [result] = await db.query("DELETE FROM summaries WHERE id = ?", [id]);
  return result.affectedRows;
};
