import dotenv from "dotenv";

// Carrega .env.local PRIMEIRO para sobrescrever variáveis
dotenv.config({ path: ".env.local" });
dotenv.config(); // Depois carrega .env como fallback

import app from "../app.js";

const PORT = process.env.PORT || 3001;
const AI_PROVIDER = process.env.AI_PROVIDER?.toLowerCase() || "groq";
const providerName = "⚡ Groq";

app.listen(PORT, () => {
  console.log(`🚀 ClickBot v3 (${providerName}) em http://localhost:${PORT}`);
});
