import { createOllamaChat } from './src/genAI/ollama_config.js';

async function testOllama() {
  try {
    console.log('[Test] Creating Ollama chat instance...');
    const chat = await createOllamaChat(null, []);
    console.log('[Test] Chat instance created ✓');

    console.log('[Test] Sending message to Ollama...');
    const response = await chat.sendMessage({ message: 'Olá, tudo bem?' });
    console.log('[Test] Response received ✓');
    console.log('[Test] Response:', JSON.stringify(response, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('[Test] ERROR:', err.message);
    console.error('[Test] Stack:', err.stack);
    process.exit(1);
  }
}

testOllama();
