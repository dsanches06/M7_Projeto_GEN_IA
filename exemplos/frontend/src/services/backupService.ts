import { UserService, TaskService } from "./index.js";

/* Serviço para backup de dados */
export class BackupService {
  async exportUsers() {
    return JSON.stringify(await UserService.getUsers());
  }
  async exportTasks() {
    return JSON.stringify(await TaskService.getTasks());
  }

  async exportAssignments() {
    const assignments = (await TaskService.getTasks()).map((task) => ({
      taskId: task.getId(),
      assignedTo: task.getAssignees?.()[0]?.user_id ?? null,
    }));
    return JSON.stringify(assignments);
  }

  async exportAll() {
    return {
      users: await this.exportUsers(),
      tasks: await this.exportTasks(),
      assignments: await this.exportAssignments(),
    };
  }
}
