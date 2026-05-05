var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createTaskCard } from "./index.js";
import { ProjectService, TaskService, UserService, } from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
export class TaskDashboardUI {
    constructor() {
        this.projects = [];
        this.tasksByProject = new Map();
        this.userMap = new Map();
        this.container = document.createElement("div");
        this.container.id = "taskDashboardContainer";
        this.container.className = "task-dashboard-container";
    }
    /**
     * Carrega dados da API e renderiza
     */
    loadAndRender() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadProjectsAndTasks();
                yield this.render();
            }
            catch (error) {
                console.error("Erro ao inicializar dashboard de tarefas:", error);
                showInfoBanner("Erro ao carregar dashboard de tarefas", "error-banner");
                console.error("Erro ao carregar dados:", error);
                this.container.innerHTML = `
        <div class="empty-state">
          <p>Erro ao carregar tarefas</p>
        </div>
      `;
            }
            return this.container;
        });
    }
    /**
     * Carrega projetos e tarefas da API
     */
    loadProjectsAndTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Carregar todos os usuários uma única vez
                const allUsers = yield UserService.getUsers();
                this.userMap.clear();
                allUsers.forEach((user) => {
                    this.userMap.set(user.getId(), user);
                });
                // Buscar todos os projetos
                const projectsData = yield ProjectService.getProjects();
                this.projects = projectsData;
                // Para cada projeto, buscar suas tarefas
                for (const project of this.projects) {
                    try {
                        const tasks = yield TaskService.getTasksByProject(project.getId());
                        this.tasksByProject.set(project.getId(), tasks);
                    }
                    catch (error) {
                        console.warn(`Erro ao buscar tarefas do projeto ${project.getId()}:`, error);
                        showInfoBanner("Erro ao buscar tarefas do projeto", "warning-banner");
                        this.tasksByProject.set(project.getId(), []);
                    }
                }
            }
            catch (error) {
                console.error("Erro ao carregar projetos:", error);
                showInfoBanner("Erro ao buscar tarefas do projeto", "warning-banner");
                this.projects = [];
            }
        });
    }
    /**
     * Renderiza as tarefas em um container com cards agrupadas por projeto
     */
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            this.container.innerHTML = "";
            if (this.projects.length === 0) {
                const emptyState = document.createElement("div");
                emptyState.className = "empty-state";
                emptyState.innerHTML = "<p>Nenhum projeto encontrado</p>";
                this.container.appendChild(emptyState);
                return;
            }
            // Renderizar cada projeto com suas tarefas
            for (const project of this.projects) {
                const tasks = this.tasksByProject.get(project.getId()) || [];
                const projectSection = yield this.createProjectSection(project, tasks);
                this.container.appendChild(projectSection);
            }
        });
    }
    /**
     * Cria uma seção de projeto com suas tarefas
     */
    createProjectSection(project, tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            const section = document.createElement("div");
            section.className = "project-task-section";
            // Cabeçalho do projeto
            const header = document.createElement("div");
            header.className = "project-task-header";
            const title = document.createElement("h2");
            title.textContent = project.getName();
            const taskCount = document.createElement("span");
            taskCount.textContent = `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`;
            header.appendChild(title);
            header.appendChild(taskCount);
            // Wrapper dos cards
            const tasksWrapper = document.createElement("div");
            tasksWrapper.className = "tasks-cards-wrapper";
            if (tasks.length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-project-state";
                emptyMsg.textContent = "Nenhuma tarefa neste projeto";
                tasksWrapper.appendChild(emptyMsg);
            }
            else {
                // Renderizar cards das tarefas
                for (const task of tasks) {
                    const taskCard = yield createTaskCard(task, this.userMap);
                    tasksWrapper.appendChild(taskCard);
                }
            }
            section.appendChild(header);
            section.appendChild(tasksWrapper);
            return section;
        });
    }
}
/**
 * Renderiza tarefas filtradas agrupadas por projeto em um container existente
 */
export function renderFilteredTasks(filteredTasks) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const container = document.querySelector("#taskDashboardContainer");
        if (!container) {
            console.warn("Container #taskDashboardContainer não encontrado");
            return;
        }
        container.innerHTML = "";
        if (filteredTasks.length === 0) {
            container.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma tarefa encontrada</p>
      </div>
    `;
            return;
        }
        try {
            // Carregar todos os usuários
            const allUsers = yield UserService.getUsers();
            const userMap = new Map();
            allUsers.forEach((user) => {
                userMap.set(user.getId(), user);
            });
            // Agrupar tarefas por projeto
            const projectMap = new Map();
            for (const task of filteredTasks) {
                const projectId = (_d = (_c = (_b = (_a = task.getProject) === null || _a === void 0 ? void 0 : _a.call(task)) === null || _b === void 0 ? void 0 : _b.getId) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : 0;
                if (!projectMap.has(projectId)) {
                    projectMap.set(projectId, []);
                }
                projectMap.get(projectId).push(task);
            }
            // Buscar informações dos projetos
            const projects = yield ProjectService.getProjects();
            // Renderizar cada projeto com suas tarefas
            for (const project of projects) {
                const projectTasks = projectMap.get(project.getId()) || [];
                if (projectTasks.length === 0)
                    continue;
                const projectSection = document.createElement("div");
                projectSection.className = "project-task-section";
                const header = document.createElement("div");
                header.className = "project-task-header";
                header.innerHTML = `<h2>${project.getName()}</h2><div class="project-separator"></div>`;
                const tasksWrapper = document.createElement("div");
                tasksWrapper.className = "tasks-cards-wrapper";
                for (const task of projectTasks) {
                    const taskCard = yield createTaskCard(task, userMap);
                    tasksWrapper.appendChild(taskCard);
                }
                projectSection.appendChild(header);
                projectSection.appendChild(tasksWrapper);
                container.appendChild(projectSection);
            }
        }
        catch (error) {
            console.error("Erro ao renderizar tarefas filtradas:", error);
            showInfoBanner("Erro ao filtrar tarefas", "error-banner");
        }
    });
}
