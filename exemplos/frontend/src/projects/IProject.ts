import { ProjectStatus } from "./ProjectStatus.js";

export interface IProject {
  getId(): number;
  getName(): string;
  getDescription(): string;
  getProjectStatusId(): number;
  getStartDate(): Date;
  getEndDateExpected(): Date;
  getStatus(): ProjectStatus;
  setStatus(status: ProjectStatus): void;
}
