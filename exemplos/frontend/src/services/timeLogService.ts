import { TimeLogDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTimeLogs from "../api/fetchTimeLogs.js";

/* Serviço para gerenciar registos de tempo */
export class TimeLogService {
  /* Função para obter a lista de registos de tempo */
  static async getTimeLogs(): Promise<TimeLogDTORequest[]> {
    return await fetchTimeLogs.getTimeLogs();
  }

  /* Função para obter um registo de tempo por ID */
  static async getTimeLogById(id: number): Promise<TimeLogDTORequest | null> {
    return await fetchTimeLogs.getTimeLogById(id);
  }

  /* Função para criar um novo registo de tempo */
  static async createTimeLog(timeLog: TimeLogDTORequest): Promise<TimeLogDTORequest | null> {
    return await fetchTimeLogs.createTimeLog(timeLog);
  }

  /* Função para atualizar um registo de tempo existente */
  static async updateTimeLog(id: number, timeLog: TimeLogDTORequest): Promise<TimeLogDTORequest | null> {
    return await fetchTimeLogs.updateTimeLog(id, timeLog);
  }

  /* Função para excluir um registo de tempo */
  static async deleteTimeLog(id: number): Promise<boolean> {
    return await fetchTimeLogs.deleteTimeLog(id);
  }
}
