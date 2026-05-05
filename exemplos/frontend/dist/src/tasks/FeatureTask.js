import { StateTransitions } from "../utils/index.js";
import { BaseEntity } from "../models/index.js";
import { TaskStatus } from "./TaskStatus.js";
/* Implementação da tarefa Feature */
export class FeatureTask extends BaseEntity {
    constructor(id, title, description, category, project) {
        super(id);
        this.assignees = [];
        this.title = title;
        this.description = description;
        this.completed = false;
        this.status = TaskStatus.CREATED;
        this.category = category;
        this.project = project;
    }
    getCreatedAt() {
        return super.getCreatedAt();
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getCompleted() {
        return this.completed;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
    getType() {
        return "Feature";
    }
    getTaskCategory() {
        return this.category;
    }
    getCompletedDate() {
        return this.completeDate;
    }
    setCompletedDate(date) {
        this.completeDate = date;
    }
    getProject() {
        return this.project;
    }
    setProject(project) {
        this.project = project;
    }
    markCompleted() {
        this.completed = true;
        this.setCompletedDate(new Date());
    }
    moveTo(status) {
        try {
            const canTransition = StateTransitions.validTransitions(this.getStatus(), status);
            // Validar transição
            if (canTransition) {
                this.setStatus(status);
                if (status === TaskStatus.COMPLETED) {
                    this.markCompleted();
                    this.setCompletedDate(new Date());
                }
            }
        }
        catch (error) {
            console.error(`ERRO: Transição de ${TaskStatus[this.getStatus()]} para ${TaskStatus[status]} não é permitida. ${error}`);
        }
    }
    /* Obter lista de assignees desta tarefa */
    getAssignees() {
        return this.assignees;
    }
    /* Definir lista de assignees desta tarefa */
    setAssignees(assignees) {
        this.assignees = assignees;
    }
    /* Obter usuário associado à tarefa */
    getUser() {
        return this.user;
    }
    /* Definir usuário associado à tarefa */
    setUser(user) {
        this.user = user;
    }
    /* Criar projeto dummy para uso quando projeto não é fornecido */
    createDummyProject() {
        return {
            getId: () => 0,
            getName: () => "Default Project",
            getDescription: () => "Default project",
            getProjectStatusId: () => 0,
            getStartDate: () => new Date(),
            getEndDateExpected: () => new Date(),
            getStatus: () => "Ativo",
            setStatus: () => { },
        };
    }
}
