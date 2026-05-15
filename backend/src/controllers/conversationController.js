import { conversationService, taskService } from "../services/index.js";

/* Devolve todas as conversas existentes */
export const getConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getAllConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar conversas" });
  }
};

/* Devolve uma conversa pelo ID */
export const getConversationById = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(
      Number(req.params.id),
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversa não encontrada" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar conversa" });
  }
};

/* Cria uma nova conversa com o título fornecido */
export const createConversation = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "O título da conversa não pode ser vazio" });
    }

    const conversation = await conversationService.createConversation(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar conversa" });
  }
};

/* Elimina a conversa e desvincula-a de todas as tarefas associadas */
export const deleteConversation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const conversation = await conversationService.deleteConversation(id);

    // Remove a referência da conversa em todas as tarefas
    await taskService.removeConversationFromAllTasks(id);

    res.status(200).json({ message: "Conversa deletada com sucesso", conversation });
  } catch (error) {
    res.status(404).json({ message: "Erro ao deletar conversa" });
  }
};

/* Actualiza o título de uma conversa existente */
export const updateConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "O título da conversa não pode ser vazio" });
    }

    const conversation = await conversationService.updateConversation(
      conversationId,
      req.body,
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversa não encontrada" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar conversa" });
  }
};

