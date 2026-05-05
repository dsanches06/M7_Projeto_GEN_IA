import { get, getById, create, put, remove } from "./index.js";
import { ReminderDTORequest } from "./dto/index.js";

const ENDPOINT = "reminders";

/* Função para obter a lista de lembretes */
export async function getReminders(
  sort?: string,
  search?: string,
): Promise<ReminderDTORequest[]> {
  return get<ReminderDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um lembrete por ID */
export async function getReminderById(
  id: number,
): Promise<ReminderDTORequest | null> {
  return getById<ReminderDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo lembrete */
export async function createReminder(
  reminder: Partial<ReminderDTORequest>,
): Promise<ReminderDTORequest | null> {
  return create<ReminderDTORequest>(ENDPOINT, reminder);
}

/* Função para atualizar um lembrete */
export async function updateReminder(
  id: number,
  reminder: Partial<ReminderDTORequest>,
): Promise<ReminderDTORequest | null> {
  return put<ReminderDTORequest>(ENDPOINT, id, reminder);
}

/* Função para deletar um lembrete */
export async function deleteReminder(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

