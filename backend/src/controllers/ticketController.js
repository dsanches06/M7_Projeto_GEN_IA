import { ticketService, taskService, userService } from "../services/index.js";
import { normalizeTicketFields } from "../utils/fieldMapper.js";

export const getTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar tiquetes" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: "Tiquete não encontrado" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar tiquete" });
  }
};

export const createTicket = async (req, res) => {
  try {
    const normalized = normalizeTicketFields(req.body);
    const { user_id, user_report, error_type } = normalized;
    if (!user_id || !user_report || !error_type)
      return res.status(400).json({ message: "Campos obrigatórios em falta" });

    const user = await userService.getUserById(user_id);
    if (!user)
      return res.status(404).json({ message: `Utilizador ${user_id} não encontrado.` });

    const ticket = await ticketService.createTicket(normalized);
    res.status(201).json(ticket);
  } catch (error) {
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: "Erro ao criar tiquete" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const normalized = normalizeTicketFields(req.body);
    const ticket = await ticketService.updateTicket(Number(req.params.id), normalized);
    if (!ticket) return res.status(404).json({ message: "Tiquete não encontrado" });
    res.status(200).json({ message: "Atualizado com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: "Erro ao atualizar tiquete" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await ticketService.deleteTicket(id);
    await taskService.removeTicketFromAllTasks(id);
    res.status(200).json({ message: "Tiquete deletado com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao deletar tiquete" });
  }
};
