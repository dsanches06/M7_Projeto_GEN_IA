import { ReminderDTORequest } from "../api/dto/index.js";
import * as fetchReminders from "../api/index.js";

/* Serviço para gerenciar lembretes */
export class ReminderService {
  /* Função para obter a lista de lembretes */
  static async getReminders(): Promise<ReminderDTORequest[]> {
    return await fetchReminders.getReminders();
  }

  /* Função para obter um lembrete por ID */
  static async getReminderById(id: number): Promise<ReminderDTORequest | null> {
    return await fetchReminders.getReminderById(id);
  }

  /* Função para criar um novo lembrete */
  static async createReminder(reminder: any): Promise<ReminderDTORequest | null> {
    return await fetchReminders.createReminder(reminder);
  }

  /* Função para atualizar um lembrete existente */
  static async updateReminder(id: number, reminder: any): Promise<ReminderDTORequest | null> {
    return await fetchReminders.updateReminder(id, reminder);
  }

  /* Função para excluir um lembrete */
  static async deleteReminder(id: number): Promise<boolean> {
    return await fetchReminders.deleteReminder(id);
  }
}

