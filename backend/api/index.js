// Handler serverless — delega cada pedido à app Express
import app from "../src/app.js";

// Função de entrada para ambientes serverless (ex: Vercel)
export default function handler(req, res) {
  return app(req, res);
}