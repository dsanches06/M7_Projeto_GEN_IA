import { Ollama } from 'ollama';

// Cria a instância apontando explicitamente para o host local
const localOllama = new Ollama({ host: 'http://127.0.0.1:11434' });

async function chat() {
  const response = await localOllama.chat({
    model: "llama3",
    messages: [
      { role: "user", content: "Qual é a capital de Portugal?" },
      { role: "assistant", content: "A capital de Portugal é Lisboa." },
      { role: "user", content: "O que há de interessante para visitar lá?" },
    ],
  });
  console.log(response.message.content);
}

async function stream() {
  const response = await localOllama.chat({
    model: "llama3",
    messages: [
      { role: "user", content: "Conte uma história curta sobre robôs." },
    ],
    stream: true,
  });

  for await (const part of response) {
    process.stdout.write(part.message.content);
  }
}

// Função principal que controla o fluxo sequencial
async function main() {
  console.log("--- INICIANDO STREAM ---");
  await stream();
  
  console.log("\n\n--- INICIANDO CHAT ---");
  await chat();
}

// Executa o programa
main();
