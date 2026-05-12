// ======================================================
// FILE: create_ticket.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

// Define a função em que o modelo pode chamar para controlar os tickets
class CreateTicketFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_create_ticket_values",

      description: "Define os valores para criar um ticket no ClickUp",

      properties: {
        user_report: {
          type: Type.STRING,
          description: "Relato do utilizador sobre o problema ou solicitação",
        },

        error_type: {
          type: Type.STRING,
          description: "Tipo de erro",
        },

        severity: {
          type: Type.INTEGER,
          description: "ID do nível de severidade do ticket (1-10)",
        },

        fix_suggestion: {
          type: Type.STRING,
          description: "Sugestão de correção",
        },

        created_at: {
          type: Type.STRING,
          format: "date-time",
          description: "Data de criação",
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  // Mapeia os argumentos recebidos para os campos esperados pela função
  mapValues(args = {}) {
    const { user_report, error_type, severity, fix_suggestion, created_at } =
      args;

    // Retorna um objeto com os valores mapeados,
    // usando métodos auxiliares para garantir o formato correto
    return {
      user_report: this.parseString(user_report),
      error_type: this.parseString(error_type),
      severity: this.parseNumber(severity, 10),
      fix_suggestion: this.parseString(fix_suggestion),
      created_at: created_at || this.currentDate(),
    };
  }
}

//singleton para exportar a função e evitar múltiplas instâncias
const createTicketFunction = new CreateTicketFunction();

// Exporta a declaração da função para que o modelo possa utilizá-la
export const setTicketValuesFunctionDeclaration =
  createTicketFunction.getDeclaration();

// Lista de declarações de funções disponíveis para o modelo
export const functionDeclarations = [setTicketValuesFunctionDeclaration];

// Função que será chamada pelo modelo para criar o ticket, recebe os valores definidos na função acima e retorna um objeto com esses valores
export const setCreateTicketValues =
  createTicketFunction.execute.bind(createTicketFunction);
