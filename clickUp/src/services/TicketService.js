import BaseService from "./BaseService.js";
import Ticket from "../models/Ticket.js";

/**
 * TicketService - Serviço de Tickets
 * Herda de BaseService para reutilizar lógica de streaming e comunicação
 */
class TicketService extends BaseService {
  constructor() {
    super("/tickets");
  }

  /**
   * Busca todos os tickets
   */
  async getTickets() {
    try {
      const data = await this.fetchData("/tickets");
      return data.map(
        (ticket) =>
          new Ticket(
            ticket.id,
            ticket.user_report,
            ticket.error_type,
            ticket.severity,
            ticket.fix_suggestion,
            ticket.status,
            ticket.created_at,
          ),
      );
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  /**
   * Busca ticket por ID
   */
  async getTicketById(ticketId) {
    try {
      const data = await this.fetchData(`/tickets/${ticketId}`);
      return new Ticket(
        data.id,
        data.user_report,
        data.error_type,
        data.severity,
        data.fix_suggestion,
        data.status,
        data.created_at,
      );
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw error;
    }
  }

  /**
   * Envia mensagem para criar ticket com streaming
   */
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    ticketId = null,
  ) {
    const payload = {
      message,
      conversationHistory,
      ticketId,
    };
    return this.sendStreamMessage(
      "/tickets/message/stream",
      payload,
      onChunk,
      onDone,
    );
  }

  /**
   * Cria ticket
   */
  async createTicket(ticketData) {
    try {
      const response = await this.sendMessage("/tickets", ticketData);
      return new Ticket(
        response.id,
        response.user_report,
        response.error_type,
        response.severity,
        response.fix_suggestion,
        response.status,
        response.created_at,
      );
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  }

  /**
   * Atualiza ticket
   */
  async updateTicket(ticketId, ticketData) {
    try {
      const response = await this.sendMessage(
        `/tickets/${ticketId}`,
        ticketData,
      );
      return response;
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  }

  /**
   * Deleta ticket
   */
  async deleteTicket(ticketId) {
    try {
      const response = await fetch(
        `${this.BACKEND_URL}/tickets/${ticketId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  }

  /**
   * Extrai dados de ticket do function result
   */
  extractTicketDataFromFunctionResult(functionResult) {
    if (!functionResult || !functionResult.result) {
      return null;
    }

    const data = functionResult.result;
    return {
      user_report: data.user_report,
      error_type: data.error_type,
      severity: data.severity,
      fix_suggestion: data.fix_suggestion,
      status: data.status || "open",
    };
  }
}

// Exporta instância singleton
export const ticketService = new TicketService();