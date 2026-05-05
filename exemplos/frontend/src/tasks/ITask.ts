import { IProject } from "../projects/index.js";
import { TaskCategory } from "./TaskCategory.js";
import { TaskStatus } from "./TaskStatus.js";

/* Interface que define o contrato para uma tarefa */
export interface ITask {
  getId(): number;
  getCreatedAt(): Date;
  setTitle(title: string): void;
  getTitle(): string;
  setDescription(description: string): void;
  getDescription(): string | undefined;
  getCompleted(): boolean;
  getStatus(): TaskStatus;
  setStatus(status: TaskStatus): void;
  getType(): string;
  getCompletedDate(): Date;
  getProject(): IProject;
  setProject(project: IProject): void;
  getTaskCategory(): TaskCategory;
  markCompleted(): void;
  moveTo(status: TaskStatus): void;
  getAssignees?(): any[];
  setAssignees?(assignees: any[]): void;
}
