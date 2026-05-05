var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProjectService, TaskService, SprintService, } from "../../services/index.js";
import { renderSprintModal, renderTaskModal } from "../modal/index.js";
import { createHeadingTitle, activateMenu } from "../dom/index.js";
import { renderSprintsCards } from "../sprints/index.js";
import { renderTaskCards } from "../tasks/index.js";
import { loadProjectsPage } from "./index.js";
import { showInfoBanner } from "../../helpers/index.js";
// =======================
// INIT
// =======================
export function renderProjectDashboard(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const root = document.createElement("div");
        root.id = "dashboardProject";
        root.innerHTML = "";
        const project = yield ProjectService.getProjectById(id);
        const projectName = (project === null || project === void 0 ? void 0 : project.getName()) || "Projeto";
        const backBtn = document.createElement("button");
        backBtn.className = "back-btn";
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
        backBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const projects = yield ProjectService.getProjects();
            activateMenu("#menuProjects");
            yield loadProjectsPage(projects);
        }));
        root.appendChild(backBtn);
        // Criar container principal com abas/seções
        const container = document.createElement("div");
        container.className = "dashboard-container";
        // Cabeçalho do dashboard
        const heading = createHeadingTitle("h2", `DASHBOARD DO PROJETO: ${projectName}`);
        container.appendChild(heading);
        // Conteúdo principal em coluna: sprints em cima, tarefas embaixo
        const dashboardContent = document.createElement("div");
        dashboardContent.className = "project-dashboard-content";
        dashboardContent.style.display = "flex";
        dashboardContent.style.flexDirection = "column";
        dashboardContent.appendChild(yield createSprintsSection(id));
        dashboardContent.appendChild(yield createTasksSection(id));
        container.appendChild(dashboardContent);
        root.appendChild(container);
        return root;
    });
}
// =======================
// SPRINTS SECTION
// =======================
function createSprintsSection(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.createElement("div");
        section.className = "project-dashboard-section sprints-section";
        try {
            // Carregar sprints do projeto
            const allSprints = yield SprintService.getSprints();
            const projectSprints = allSprints.filter((s) => s.project_id === projectId);
            // Criar header com título e botão
            const header = document.createElement("div");
            header.className = "project-section-header";
            const titleWrapper = document.createElement("div");
            titleWrapper.className = "section-title-wrapper";
            const title = document.createElement("h3");
            title.textContent = `Sprints (${projectSprints.length})`;
            titleWrapper.appendChild(title);
            const addBtn = document.createElement("button");
            addBtn.className = "btn primary";
            addBtn.textContent = "+ Novo Sprint";
            addBtn.addEventListener("mouseover", () => {
                addBtn.style.opacity = "0.9";
            });
            addBtn.addEventListener("mouseout", () => {
                addBtn.style.opacity = "1";
            });
            addBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                yield renderSprintModal(projectId);
            }));
            header.appendChild(titleWrapper);
            header.appendChild(addBtn);
            section.appendChild(header);
            const cardsContainer = document.createElement("div");
            cardsContainer.id = "projectSprintsContainer";
            cardsContainer.className = "project-section-cards";
            section.appendChild(cardsContainer);
            // Renderizar sprints em cards/lista
            if (projectSprints.length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-message";
                emptyMsg.textContent =
                    "Nenhum sprint criado ainda. Clique em '+ Novo Sprint' para começar.";
                section.appendChild(emptyMsg);
            }
            else {
                const sprintsContainer = yield renderSprintsCards(projectSprints);
                cardsContainer.appendChild(sprintsContainer);
            }
        }
        catch (error) {
            console.error("Erro ao carregar sprints:", error);
            showInfoBanner("Erro ao carregar sprints do projeto", "error-banner");
            const errorMsg = document.createElement("p");
            errorMsg.className = "error-message";
            errorMsg.textContent = "Erro ao carregar sprints do projeto";
            section.appendChild(errorMsg);
        }
        return section;
    });
}
// =======================
// TASKS SECTION
// =======================
function createTasksSection(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.createElement("div");
        section.className = "project-dashboard-section tasks-section";
        try {
            const tasks = yield TaskService.getTasksByProject(projectId);
            const header = document.createElement("div");
            header.className = "project-section-header";
            const titleWrapper = document.createElement("div");
            titleWrapper.className = "section-title-wrapper";
            const title = document.createElement("h3");
            title.textContent = `Tarefas (${tasks.length})`;
            titleWrapper.appendChild(title);
            const addBtn = document.createElement("button");
            addBtn.className = "btn primary";
            addBtn.textContent = "+ Nova Tarefa";
            addBtn.addEventListener("mouseover", () => {
                addBtn.style.opacity = "0.9";
            });
            addBtn.addEventListener("mouseout", () => {
                addBtn.style.opacity = "1";
            });
            addBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                yield renderTaskModal(projectId, undefined, undefined, () => __awaiter(this, void 0, void 0, function* () {
                    const dashboardElement = document.querySelector("#dashboardProject");
                    if (dashboardElement) {
                        const projectDashboard = yield renderProjectDashboard(projectId);
                        dashboardElement.replaceWith(projectDashboard);
                    }
                }));
            }));
            header.appendChild(titleWrapper);
            header.appendChild(addBtn);
            section.appendChild(header);
            const tasksContent = document.createElement("div");
            tasksContent.className = "project-section-cards";
            if (tasks.length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-message";
                emptyMsg.textContent =
                    "Nenhuma tarefa criada ainda. Clique em '+ Nova Tarefa' para começar.";
                tasksContent.appendChild(emptyMsg);
            }
            else {
                const tasksList = document.createElement("div");
                tasksList.className = "project-tasks-grid";
                const renderedTasksContainer = yield renderTaskCards(tasks);
                tasksList.appendChild(renderedTasksContainer);
                tasksContent.appendChild(tasksList);
            }
            section.appendChild(tasksContent);
        }
        catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            showInfoBanner("Erro ao carregar tarefas do projeto", "error-banner");
            const errorMsg = document.createElement("p");
            errorMsg.className = "error-message";
            errorMsg.textContent = "Erro ao carregar tarefas do projeto";
            section.appendChild(errorMsg);
        }
        return section;
    });
}
// Exportar função para uso em outros módulos (evitar dependências circulares)
export { createSprintsSection };
