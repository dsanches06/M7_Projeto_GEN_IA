import { userService } from "../services/index.js";

// Middleware que verifica a existência do utilizador e anexa-o a req.user
export const checkUserExists = async (req, res, next) => {
  // Sem ID no parâmetro — avança sem validar
  if (!req.params.id) {
    return next();
  }

  try {
    const userId = Number(req.params.id);
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    req.user = user; // Torna o utilizador acessível nos handlers seguintes
    next();
  } catch (error) {
    console.error(`Erro ao verificar usuário com ID ${req.params.id}:`, error);
    return res.status(500).json({ error: "Erro ao verificar utilizador" });
  }
};
