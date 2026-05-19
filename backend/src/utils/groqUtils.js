export const MODEL_QUEUE = [
  "openai/gpt-oss-120b", // preferência inicial (OpenAI)
  "openai/gpt-oss-20b",  // segunda opção da mesma família
  "qwen/qwen3-32b",      // alternativa de alta lógica (Alibaba)
  "groq/compound",       // modelo nativo ultra-rápido (Groq)
  "groq/compound-mini",  // backup leve de altíssima velocidade (Groq)
];

// Nível de esforço de raciocínio para modelos OpenAI na Groq (low | medium | high).
// Ativa-se via variável de ambiente GROQ_REASONING_EFFORT. Omitido por padrão.
const REASONING_EFFORT = process.env.GROQ_REASONING_EFFORT || null;

/**
 * Devolve true se o modelo suporta reasoning_effort (modelos OpenAI na Groq).
 */
export function supportsReasoningEffort(model = "") {
  return model.startsWith("openai/");
}

/**
 * Envia mensagens para o Groq percorrendo a fila de modelos se esgotar o limite de tokens.
 * @param {import('groq-sdk').Groq} groqInstance
 * @param {Array} messages
 * @param {Object} options - Opções extras (temperature, tools, etc.)
 * @param {string[]} queue - Fila de modelos a tentar em sequência
 * @param {number} modelIndex
 */
export async function chatWithFallback(
  groqInstance,
  messages,
  options = {},
  queue = MODEL_QUEUE,
  modelIndex = 0
) {
  if (modelIndex >= queue.length) {
    throw new Error("Todos os modelos disponíveis na lista excederam o limite de tokens.");
  }

  const currentModel = queue[modelIndex];
  console.log(`A tentar o modelo: ${currentModel}...`);

  // Adiciona reasoning_effort apenas nos modelos OpenAI que o suportam
  const reasoningOptions =
    REASONING_EFFORT && supportsReasoningEffort(currentModel)
      ? { reasoning_effort: REASONING_EFFORT }
      : {};

  try {
    const completion = await groqInstance.chat.completions.create({
      model: currentModel,
      messages,
      ...options,
      ...reasoningOptions,
    });

    completion.modelUsed = currentModel;
    return completion;
  } catch (error) {
    if (
      error.status === 429 ||
      error.message?.includes("rate limit") ||
      error.message?.includes("tokens")
    ) {
      console.warn(`⚠️ Limite excedido no modelo ${currentModel}. A alternar para o próximo...`);
      return await chatWithFallback(groqInstance, messages, options, queue, modelIndex + 1);
    }
    throw error;
  }
}
