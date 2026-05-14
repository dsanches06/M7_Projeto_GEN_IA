export const ROLE_USER = 2;
export const ROLE_ASSISTANT = 3;

export const STATUS_NAME = {
  1: "CREATED",
  2: "ASSIGNED",
  3: "IN_PROGRESS",
  4: "BLOCKED",
  5: "COMPLETED",
  6: "ARCHIVED",
};

export const PROVIDER_ERROR_MESSAGES = {
  SERVICE_DOWN:
    "⚠️ O serviço de IA está temporariamente em baixo. Tente novamente em instantes.",
  RATE_LIMIT:
    "⏳ Limite de pedidos atingido. Aguarde alguns segundos e tente novamente.",
  AUTH_ERROR:
    "🔑 Erro de autenticação com o serviço de IA. Contacte o administrador.",
  NETWORK_ERROR:
    "🌐 Sem ligação ao serviço de IA. Verifique a internet e tente novamente.",
  INVALID_REQUEST:
    "✏️ O pedido não pôde ser processado. Tente reformular a mensagem.",
  UNKNOWN: "🤖 O assistente de IA não está disponível. Tente novamente.",
};
