import { StateTransitions } from "../utils/index.js";
import { IUser, BaseEntity } from "../models/index.js";
import { ITask } from "./index.js";
import { TaskCategory } from "./TaskCategory.js";
import { TaskStatus } from "./TaskStatus.js";
import { IProject } from "../projects/index.js";

/* Implementação da tarefa de bug */
export class BugTask extends BaseEntity implements ITask {
  private title: string;
  private description?: string;
  private completed: boolean;
  private completeDate?: Date;
  private status: TaskStatus;
  private category: TaskCategory;
  private project: IProject;
  private assignees: any[] = [];

  constructor(
    id: number,
    title: string,
    description: string | undefined,
    category: TaskCategory,
    project: IProject,
  ) {
    super(id);
    this.title = title;
    this.description = description;
    this.completed = false;
    this.status = TaskStatus.CREATED;
    this.category = category;
    this.project = project;
  }

  getCreatedAt(): Date {
    return super.getCreatedAt();
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getCompleted(): boolean {
    return this.completed;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  setStatus(status: TaskStatus): void {
    this.status = status;
  }

  getType(): string {
    return "Bug";
  }

  getTaskCategory(): TaskCategory {
    return this.category;
  }

  getCompletedDate(): Date {
    return this.completeDate!;
  }

  setCompletedDate(date: Date): void {
    this.completeDate = date;
  }

  getProject(): IProject {
    return this.project;
  }

  setProject(project: IProject): void {
    this.project = project;
  }

  markCompleted(): void {
    this.completed = true;
    this.setCompletedDate(new Date());
  }

  moveTo(status: TaskStatus): void {
    try {
      const canTransition = StateTransitions.validTransitions(
        this.getStatus(),
        status,
      );
      // Validar transição
      if (canTransition) {
        this.setStatus(status);
        if (status === TaskStatus.COMPLETED) {
          this.markCompleted();
          this.setCompletedDate(new Date());
        }
      }
    } catch (error) {
    console.error(
        `ERRO: Transição de ${TaskStatus[this.getStatus()]} para ${TaskStatus[status]} não é permitida. ${error}`,
      );
    }
  }

  /* Obter lista de assignees desta tarefa */
  getAssignees(): any[] {
    return this.assignees;
  }

  /* Definir lista de assignees desta tarefa */
  setAssignees(assignees: any[]): void {
    this.assignees = assignees;
  }
}
