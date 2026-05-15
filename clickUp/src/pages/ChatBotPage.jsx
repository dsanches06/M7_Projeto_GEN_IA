import { ChatBot } from '@/components/chat';

/**
 * Página com o componente ChatBot
 * Use isso como exemplo de como integrar o bot em sua aplicação
 */
// Página dedicada ao assistente de IA
export function ChatBotPage() {
  return (
    <div className="p-6 h-screen">
      <ChatBot />
    </div>
  );
}

export default ChatBotPage;
