import * as summaryService from "../services/summaryService.js";

/* Função para buscar resumos de hstorico de chat */
export const getSummaries = async (req, res) => {
  try {
    const summaries = await summaryService.getAllSummaries();

    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar resumos de reuniões" });
  }
};

// Busca resumo por ID
export const getSummaryById = async (req, res) => {
  try {
    const summary = await summaryService.getSummaryById(Number(req.params.id));
    if (!summary) {
      return res.status(404).json({ message: "Resumo não encontrado" });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar resumo de reunião" });
  }
};

// Busca resumo por ID da conversa
export const getSummaryByConversationId = async (req, res) => {
  try {
    const summary = await summaryService.getSummaryByConversationId(
      Number(req.params.conversationId),
    );
    if (!summary) {
      return res.status(404).json({ message: "Resumo não encontrado" });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar resumo de reunião" });
  }
};

/* Função para criar resumo de reunião */
export const createSummary = async (req, res) => {
  try {
    const { conversationId, original_text, summary: summaryText } = req.body;

    if (
      !conversationId ||
      !original_text ||
      original_text.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ message: "conversationId e original_text são obrigatórios" });
    }

    const summary = await summaryService.createSummary(req.body);
    res.status(201).json(summary);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar resumo de reunião" });
  }
};

/* Função para deletar resumo de reunião */
export const deleteSummary = async (req, res) => {
  try {
    const summary = await summaryService.deleteSummary(Number(req.params.id));
    //await taskService.removeMeetingSummaryFromAllTasks(Number(req.params.id));
    res
      .status(200)
      .json({ message: "Resumo de reunião deletado com sucesso", summary });
  } catch (error) {
    res.status(404).json({ message: "Erro ao deletar resumo de reunião" });
  }
};

/* Função para atualizar resumo de reunião */
export const updateSummary = async (req, res) => {
  try {
    const summaryId = Number(req.params.id);
    const { conversationId, original_text, summary } = req.body;

    if (
      !conversationId ||
      !original_text ||
      original_text.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ message: "conversationId e original_text são obrigatórios" });
    }

    const summary = await summaryService.updateSummary(summaryId, req.body);
    if (!summary) {
      return res
        .status(404)
        .json({ message: "Resumo de reunião não encontrado" });
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar resumo de reunião" });
  }
};
