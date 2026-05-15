import { userService } from "../../services/index.js";
import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo buscar utilizadores por nome.
 * Usada quando o utilizador menciona um nome e o bot precisa encontrar o ID.
 */
class SearchUserFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "get_user_by_name",
        description:
          "Busca utilizadores por nome (ex: 'Ana' encontra 'Ana Silva' mas não 'Joana'; 'Jo' encontra 'Joana' e 'João')",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome do utilizador a buscar (pode ser parcial)",
            },
          },
          required: ["name"],
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    const { name } = args;
    return {
      name: this.parseString(name),
    };
  }

  async execute(args = {}) {
    const mapped = this.mapValues(args);
    return this.executeMapped(mapped);
  }

  async executeMapped(args) {
    const { name } = args;
    if (!name) {
      throw new Error("Nome é obrigatório para buscar utilizador.");
    }

    const users = await userService.getAllUsers(name, null); // search sem sort

    if (users.length === 0) {
      return { message: `O utilizador com nome "${name}" não existe.` };
    }

    if (users.length === 1) {
      return { user: users[0] };
    }

    // Múltiplos resultados
    return { users };
  }
}

const searchUserFunction = new SearchUserFunction();

export const getUserDeclarations = searchUserFunction.getDeclaration();
export const functionDeclarations = [getUserDeclarations];
export const getUserByName =
  searchUserFunction.execute.bind(searchUserFunction);
