import { BaseEntity } from "../models/index.js";
import { IProject } from "./index.js";
import { ProjectStatus } from "./ProjectStatus.js";

export class Project extends BaseEntity implements IProject {
  private name: string;
  private description: string;
  private projectStatusId: number;
  private startDate: Date;
  private endDateExpected: Date;
  private status: ProjectStatus;

  constructor(
    id: number,
    name: string,
    description: string,
    projectStatusId: number,
    startDate: Date,
    endDateExpected: Date,
  ) {
    super(id);
    this.name = name;
    this.description = description;
    this.projectStatusId = projectStatusId;
    this.startDate = startDate;
    this.endDateExpected = endDateExpected;
    this.status = ProjectStatus.ACTIVE;
  }

  public getId(): number {
    return super.getId();
  }

  public getName(): string {
    return this.name;
  }
  public getDescription(): string {
    return this.description;
  }
  public getProjectStatusId(): number {
    return this.projectStatusId;
  }
  public getStartDate(): Date {
    return this.startDate;
  }
  public getEndDateExpected(): Date {
    return this.endDateExpected;
  }

  public getStatus(): ProjectStatus {
    return this.status;
  }

  public setStatus(status: ProjectStatus): void {
    this.status = status;
  }
}
