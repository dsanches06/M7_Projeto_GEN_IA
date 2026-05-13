import { Ollama } from 'ollama';

async function testDirect() {
  try {
    const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
    
    console.log('[Direct Test] Calling ollama.chat() with stream: false...');
    const response = await Promise.race([
      ollama.chat({
        model: 'llama3.2',
        messages: [{ role: 'user', content: 'Olá' }],
        stream: false,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10s')), 10000)
      )
    ]);
    
    console.log('[Direct Test] Response:', response);
  } catch (err) {
    console.error('[Direct Test] ERROR:', err.message);
    process.exit(1);
  }
}

testDirect();
