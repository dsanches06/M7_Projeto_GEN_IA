import { TaskTypeDTORequest } from "../api/dto/index.js";
import * as fetchTaskTypes from "../api/fetchTaskTypes.js";

export class TaskTypeService {
  static async getTaskTypes(): Promise<TaskTypeDTORequest[]> {
    return await fetchTaskTypes.getTaskTypes();
  }

  static async getTaskTypeById(
    id: number,
  ): Promise<TaskTypeDTORequest | null> {
    return await fetchTaskTypes.getTaskTypeById(id);
  }

  static async createTaskType(
    taskType: any,
  ): Promise<TaskTypeDTORequest | null> {
    return await fetchTaskTypes.createTaskType(taskType);
  }

  static async updateTaskType(
    id: number,
    taskType: any,
  ): Promise<TaskTypeDTORequest | null> {
    return await fetchTaskTypes.updateTaskType(id, taskType);
  }

  static async deleteTaskType(id: number): Promise<boolean> {
    return await fetchTaskTypes.deleteTaskType(id);
  }
}
