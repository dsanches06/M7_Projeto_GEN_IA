import { TaskStatus } from "../tasks/TaskStatus.js";

/* Representação de transições de estado */
export class StateTransitions {
  private static readonly TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.CREATED]: [TaskStatus.ASSIGNED, TaskStatus.BLOCKED],
    [TaskStatus.ASSIGNED]: [
      TaskStatus.CREATED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.BLOCKED,
    ],
    [TaskStatus.IN_PROGRESS]: [
      TaskStatus.CREATED,
      TaskStatus.ASSIGNED,
      TaskStatus.COMPLETED,
      TaskStatus.BLOCKED,
    ],
    [TaskStatus.BLOCKED]: [
      TaskStatus.CREATED,
      TaskStatus.ASSIGNED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.ARCHIVED,
    ],
    [TaskStatus.COMPLETED]: [TaskStatus.ARCHIVED],
    [TaskStatus.ARCHIVED]: [],
  };

  static validTransitions(current: TaskStatus, next: TaskStatus): boolean {
    const allowed = this.TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  static getNextStatus(status: TaskStatus): TaskStatus {
    const t = Object.keys(TaskStatus).map(
      (key) => (TaskStatus as any)[key],
    ) as TaskStatus[];
    const currentIndex = t.indexOf(status);
    const nextIndex = currentIndex + 1;
    return nextIndex < t.length ? t[nextIndex] : status;
  }
}
