import { get, getById, create, put, remove } from "./index.js";
import { TaskTypeDTORequest } from "./dto/index.js";

const ENDPOINT = "task_types";

export async function getTaskTypes(): Promise<TaskTypeDTORequest[]> {
  return get<TaskTypeDTORequest>(ENDPOINT);
}

export async function getTaskTypeById(
  id: number,
): Promise<TaskTypeDTORequest | null> {
  return getById<TaskTypeDTORequest>(ENDPOINT, id);
}

export async function createTaskType(
  taskType: Partial<TaskTypeDTORequest>,
): Promise<TaskTypeDTORequest | null> {
  return create<TaskTypeDTORequest>(ENDPOINT, taskType);
}

export async function updateTaskType(
  id: number,
  taskType: Partial<TaskTypeDTORequest>,
): Promise<TaskTypeDTORequest | null> {
  return put<TaskTypeDTORequest>(ENDPOINT, id, taskType);
}

export async function deleteTaskType(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}
