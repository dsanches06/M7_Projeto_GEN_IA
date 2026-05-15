import { userService } from "../services/index.js";

// Middleware de validação dos dados de utilizador (criação e actualização)
export const validateUserData = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const isUpdate = Boolean(req.params.id || req.user?.id); // Distingue criação de actualização

    if (isUpdate) {
      // Verifica se pelo menos um campo válido foi fornecido
      const fieldsToUpdate = [];

      if (name !== undefined) fieldsToUpdate.push("name");
      if (email !== undefined) fieldsToUpdate.push("email");
      if (phone !== undefined) fieldsToUpdate.push("phone");

      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: "Nenhum campo para atualizar" });
      }

      // Valida individualmente cada campo fornecido
      if (name !== undefined && (typeof name !== "string" || name.length < 3)) {
        return res
          .status(400)
          .json({ message: "Name must have at least 3 characters" });
      }

      if (
        email !== undefined &&
        (typeof email !== "string" || !email.includes("@"))
      ) {
        return res.status(400).json({ message: "Invalid email" });
      }

      if (phone !== undefined && typeof phone !== "string") {
        return res.status(400).json({ message: "Phone must be a string" });
      }
    } else {
      // Validação de campos obrigatórios na criação
      if (!name || typeof name !== "string" || name.length < 3) {
        return res
          .status(400)
          .json({ message: "Name must have at least 3 characters" });
      }

      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Invalid email" });
      }
    }

    if (email !== undefined) {
      const userId = isUpdate ? Number(req.params.id || req.user?.id) : null;
      const emailAlreadyExists = await userService.emailExists(email, userId); // Previne emails duplicados

      if (emailAlreadyExists) {
        const msg = isUpdate
          ? "This email is already registered by another user"
          : "This email is already registered";
        return res.status(400).json({ message: msg });
      }
    }
    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error validating user: ${error.message}` });
  }
};
