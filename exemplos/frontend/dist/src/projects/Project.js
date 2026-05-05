import { BaseEntity } from "../models/index.js";
import { ProjectStatus } from "./ProjectStatus.js";
export class Project extends BaseEntity {
    constructor(id, name, description, projectStatusId, startDate, endDateExpected) {
        super(id);
        this.name = name;
        this.description = description;
        this.projectStatusId = projectStatusId;
        this.startDate = startDate;
        this.endDateExpected = endDateExpected;
        this.status = ProjectStatus.ACTIVE;
    }
    getId() {
        return super.getId();
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getProjectStatusId() {
        return this.projectStatusId;
    }
    getStartDate() {
        return this.startDate;
    }
    getEndDateExpected() {
        return this.endDateExpected;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
}
