import { processChatMessage } from "../genAI/genAI.js";

/**
 * Endpoint de teste simples
 */
export const testBot = async (req, res) => {
  res.json({
    success: true,
    message: "Bot endpoint funcionando!",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Processa uma mensagem de chat com função genAI
 * Executa function calls automaticamente e retorna o resultado
 */
export const sendMessageToBot = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    console.log('Mensagem recebida:', message);

    // Validar entrada
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Mensagem não pode estar vazia",
      });
    }

    // Resposta de teste simples primeiro
    console.log('Processando mensagem...');
    const result = await processChatMessage(
      message.trim(),
      conversationHistory || []
    );

    console.log('Resultado:', result);

    // Retornar resultado
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Erro no controller:', error);
    res.status(500).json({
      success: false,
      error: "Erro ao processar mensagem: " + error.message,
    });
  }
};

/**
 * Processa uma mensagem em uma conversa específica
 * Recupera histórico da conversa e processa a nova mensagem
 */
export const sendMessageToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Mensagem não pode estar vazia",
      });
    }

    // TODO: Recuperar histórico de conversa do banco de dados
    // const conversationHistory = await getChatHistoryByConversationId(conversationId);

    // Processar mensagem
    const result = await processChatMessage(message.trim(), []);

    // TODO: Salvar mensagem do usuário e resposta no banco de dados

    res.status(result.success ? 200 : 400).json({
      ...result,
      conversationId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao processar mensagem: " + error.message,
    });
  }
};
