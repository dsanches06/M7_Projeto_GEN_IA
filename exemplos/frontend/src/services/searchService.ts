import { TaskStatus } from "../tasks/TaskStatus.js";
import { UserService, TaskService } from "./index.js";

/* Serviço para realizar buscas em tarefas e usuários */
export class SearchService {
  constructor() {}

  async searchByTitle(text: string) {
    return await (
      await TaskService.getTasks()
    ).filter((task) => task.getTitle().includes(text));
  }

  async searchByUser(userId: number) {
    return await UserService.getUserById(userId);
  }

  async searchByStatus(status: TaskStatus) {
    return await (
      await TaskService.getTasks()
    ).filter((task) => task.getStatus() === status);
  }

  globalSearch(query: any) {
    let results: any = [];

    if (query.title) {
      results = results.concat(this.searchByTitle(query.title));
    }

    if (query.userId) {
      results = results.concat(this.searchByUser(query.userId));
    }

    if (query.status) {
      results = results.concat(this.searchByStatus(query.status));
    }
    const uniqueIds = new Set();
    const uniqueResults = results.filter((item: any) => {
      const id = item.getId();
      if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
      }
    });
    return uniqueResults;
  }
}
