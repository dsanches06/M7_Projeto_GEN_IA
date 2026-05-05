import { get, getById, create, put, remove } from "./index.js";
import { TimeLogDTORequest } from "./dto/index.js";

const ENDPOINT = "time_logs";

/* Função para obter a lista de registros de tempo */
export async function getTimeLogs(
  sort?: string,
  search?: string,
): Promise<TimeLogDTORequest[]> {
  return get<TimeLogDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um registro de tempo por ID */
export async function getTimeLogById(
  id: number,
): Promise<TimeLogDTORequest | null> {
  return getById<TimeLogDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo registro de tempo */
export async function createTimeLog(
  timeLog: Partial<TimeLogDTORequest>,
): Promise<TimeLogDTORequest | null> {
  return create<TimeLogDTORequest>(ENDPOINT, timeLog);
}

/* Função para atualizar um registro de tempo */
export async function updateTimeLog(
  id: number,
  timeLog: Partial<TimeLogDTORequest>,
): Promise<TimeLogDTORequest | null> {
  return put<TimeLogDTORequest>(ENDPOINT, id, timeLog);
}

/* Função para deletar um registro de tempo */
export async function deleteTimeLog(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

