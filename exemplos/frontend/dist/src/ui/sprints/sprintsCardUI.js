var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TaskService, UserService, SprintService, SprintTaskService, ProjectStatusService, } from "../../services/index.js";
import { renderSprintModal } from "../modal/index.js";
import { getAvatarPath, showConfirmDialog, showInfoBanner, } from "../../helpers/index.js";
import { loadSprintsPage } from "./SprintsPageUI.js";
/* Renderiza os sprints em cards na Grid principal */
export function renderSprintsCards(sprints) {
    return __awaiter(this, void 0, void 0, function* () {
        const gridContainer = document.createElement("div");
        gridContainer.id = "sprintsGridContainer";
        gridContainer.classList.add("grid-card-container");
        for (const sprint of sprints) {
            const card = yield createSprintCard(sprint);
            gridContainer.appendChild(card);
        }
        return gridContainer;
    });
}
/* Cria a estrutura individual de cada card de sprint */
function createSprintCard(sprint) {
    return __awaiter(this, void 0, void 0, function* () {
        const card = document.createElement("div");
        card.className = "sprint-card";
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "sprint-card-content";
        // HEADER (Título)
        const header = document.createElement("div");
        header.className = "card-header";
        const title = document.createElement("h3");
        title.textContent = sprint.name || "Sprint sem nome";
        const actions = document.createElement("div");
        actions.className = "sprint-card-actions";
        actions.style.display = "flex";
        actions.style.flexDirection = "column";
        actions.style.gap = "0.5rem";
        actions.style.alignItems = "flex-end";
        const allTasks = yield TaskService.getTasks();
        const sprintTaskRelations = yield SprintTaskService.getSprintTasks();
        const sprintRelations = sprintTaskRelations.filter((relation) => relation.sprint_id === sprint.id);
        const linkedTaskIds = new Set(sprintRelations.map((relation) => relation.task_id));
        const projectId = sprint.project_id;
        const availableTasks = allTasks.filter((task) => {
            var _a, _b, _c;
            const taskId = (_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id;
            const taskProjectId = task.projectId || task.project_id || ((_c = task.project) === null || _c === void 0 ? void 0 : _c.id);
            const belongsToProject = projectId ? taskProjectId === projectId : true;
            return belongsToProject && !linkedTaskIds.has(taskId);
        });
        const editBtn = document.createElement("button");
        editBtn.className = "icon-button";
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
        editBtn.title = "Editar sprint";
        editBtn.setAttribute("aria-label", "Editar sprint");
        editBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            if (!projectId) {
                showInfoBanner("Projeto não encontrado para este sprint.", "error-banner");
                return;
            }
            yield renderSprintModal(projectId, sprint);
        }));
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "icon-button";
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        deleteBtn.title = "Excluir sprint";
        deleteBtn.setAttribute("aria-label", "Excluir sprint");
        deleteBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            if (yield showConfirmDialog(`Tem certeza que deseja excluir o sprint "${sprint.name}"?`)) {
                try {
                    yield SprintService.deleteSprint(sprint.id);
                    showInfoBanner(`Sprint "${sprint.name}" removido com sucesso.`, "success-banner");
                    // Verificar se estamos no dashboard do projeto
                    const dashboardElement = document.querySelector("#dashboardProject");
                    if (dashboardElement) {
                        // Estamos no dashboard do projeto, recarregar o dashboard inteiro
                        const projectId = sprint.project_id;
                        if (projectId) {
                            const { renderProjectDashboard } = yield import("../projects/ProjectDashboardUI.js");
                            const projectDashboard = yield renderProjectDashboard(projectId);
                            dashboardElement.replaceWith(projectDashboard);
                            return;
                        }
                    }
                    // Caso contrário, recarregar a página geral de sprints
                    const currentSprints = yield SprintService.getSprints();
                    yield loadSprintsPage(currentSprints);
                }
                catch (error) {
                    showInfoBanner(`Erro ao excluir sprint: ${error}`, "error-banner");
                }
            }
        }));
        const linkSprintBtn = document.createElement("button");
        linkSprintBtn.className = "icon-button";
        linkSprintBtn.innerHTML = `<i class="fas fa-tasks"></i>
  <i class="fas fa-plus"></i>`;
        linkSprintBtn.title = "Associar tarefa ao sprint";
        linkSprintBtn.setAttribute("aria-label", "Associar tarefa ao sprint");
        linkSprintBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield handleSprintTaskLink(sprint);
        }));
        linkSprintBtn.style.display = availableTasks.length > 0 ? "inline-flex" : "none";
        const unlinkSprintBtn = document.createElement("button");
        unlinkSprintBtn.className = "icon-button";
        unlinkSprintBtn.innerHTML = `<i class="fas fa-tasks"></i>
  <i class="fas fa-minus"></i>`;
        unlinkSprintBtn.title = "Desassociar tarefa do sprint";
        unlinkSprintBtn.setAttribute("aria-label", "Desassociar tarefa do sprint");
        unlinkSprintBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield handleSprintTaskUnlink(sprint);
        }));
        unlinkSprintBtn.style.display = sprintRelations.length > 0 ? "inline-flex" : "none";
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        actions.appendChild(linkSprintBtn);
        actions.appendChild(unlinkSprintBtn);
        header.appendChild(title);
        // STATUS (Badge)
        const status = document.createElement("span");
        let statusText = "Ativo";
        if (sprint.status_id) {
            const statusObj = yield ProjectStatusService.getProjectStatusById(sprint.status_id);
            statusText = statusObj ? statusObj.name : `Status ${sprint.status_id}`;
        }
        status.className = `sprint-status status-${statusText.toLowerCase().replace(" ", "-")}`;
        status.textContent = statusText;
        // DESCRIPTION
        const desc = document.createElement("p");
        desc.className = "sprint-desc";
        desc.textContent = sprint.description || "Sem descrição disponível";
        // INFO (Container Flex)
        const infoContainer = document.createElement("div");
        infoContainer.className = "sprint-info";
        const startDate = document.createElement("span");
        startDate.className = "start-date";
        const startDateValue = sprint.start_date || new Date();
        startDate.textContent = `Início: ${new Date(startDateValue).toLocaleDateString("pt-BR")}`;
        const endDate = document.createElement("span");
        endDate.className = "end-date";
        const endDateValue = sprint.end_date || new Date();
        endDate.textContent = `Fim: ${new Date(endDateValue).toLocaleDateString("pt-BR")}`;
        const taskCount = document.createElement("span");
        taskCount.className = "task-count";
        taskCount.textContent = `Tarefas: 0`;
        infoContainer.appendChild(startDate);
        infoContainer.appendChild(endDate);
        infoContainer.appendChild(taskCount);
        const footer = document.createElement("div");
        footer.className = "sprint-card-footer";
        const avatarStack = document.createElement("div");
        avatarStack.className = "avatar-stack";
        try {
            // Carregar tasks do sprint através da relação sprint_tasks
            const allTasks = yield TaskService.getTasks();
            const sprintTaskRelations = yield SprintTaskService.getSprintTasks();
            const sprintTasks = allTasks.filter((task) => sprintTaskRelations.some((relation) => {
                var _a, _b;
                return relation.sprint_id === sprint.id &&
                    ((_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id) === relation.task_id;
            }));
            // Atualizar contador de tarefas
            taskCount.textContent = `Tarefas: ${sprintTasks.length}`;
            // Extrair todos os user_ids únicos dos assignees
            const userIdsSet = new Set();
            sprintTasks.forEach((task) => {
                var _a;
                const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
                assignees.forEach((assignee) => {
                    if (assignee.user_id) {
                        userIdsSet.add(assignee.user_id);
                    }
                });
            });
            // Carregar todos os users para pegar gender
            const allUsers = yield UserService.getUsers();
            const userMap = new Map();
            allUsers.forEach((user) => {
                userMap.set(user.getId(), user);
            });
            // Construir array de membros com gender
            const members = [];
            userIdsSet.forEach((userId) => {
                var _a, _b;
                const user = userMap.get(userId);
                if (user) {
                    members.push({
                        userId,
                        gender: ((_b = (_a = user).getGender) === null || _b === void 0 ? void 0 : _b.call(_a)) || "Male",
                        user,
                    });
                }
            });
            // Renderizar avatares (máximo 4)
            const displayLimit = 4;
            members.slice(0, displayLimit).forEach((member, index) => {
                const img = document.createElement("img");
                img.className = "avatar-img";
                // Selecionar pasta baseado no gender
                const randomValue = (index % 4) + 1; // 1-4
                img.src = getAvatarPath(member.userId, member.gender, randomValue);
                img.alt = member.user.getName();
                img.title = member.user.getName();
                avatarStack.appendChild(img);
            });
            // Mostrar "+X" se houver mais membros
            if (members.length > displayLimit) {
                const more = document.createElement("span");
                more.className = "avatar-more";
                more.textContent = `+${members.length - displayLimit}`;
                avatarStack.appendChild(more);
            }
        }
        catch (error) {
            showInfoBanner("Erro ao carregar membros do sprint", "error-banner");
            console.error("Erro ao carregar membros do sprint:", error);
        }
        footer.appendChild(avatarStack);
        // Adicionar ao card na ordem correta
        contentWrapper.appendChild(header);
        contentWrapper.appendChild(status);
        contentWrapper.appendChild(desc);
        contentWrapper.appendChild(infoContainer);
        contentWrapper.appendChild(footer);
        card.append(contentWrapper, actions);
        return card;
    });
}
function handleSprintTaskLink(sprint) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const projectId = sprint.projectId || sprint.project_id || ((_a = sprint.project) === null || _a === void 0 ? void 0 : _a.id);
            const allTasks = yield TaskService.getTasks();
            const sprintTaskRelations = yield SprintTaskService.getSprintTasks();
            const linkedTaskIds = new Set(sprintTaskRelations
                .filter((relation) => relation.sprint_id === sprint.id)
                .map((relation) => relation.task_id));
            const availableTasks = allTasks.filter((task) => {
                var _a, _b, _c;
                const taskId = (_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id;
                const taskProjectId = task.projectId || task.project_id || ((_c = task.project) === null || _c === void 0 ? void 0 : _c.id);
                const belongsToProject = projectId ? taskProjectId === projectId : true;
                return belongsToProject && !linkedTaskIds.has(taskId);
            });
            if (availableTasks.length === 0) {
                showInfoBanner("Não há tarefas disponíveis sem vínculo ao sprint.", "warning-banner");
                return;
            }
            yield renderSprintTaskSelectionModal(sprint, availableTasks, "link");
        }
        catch (error) {
            console.error("Erro ao carregar tarefas para associar ao sprint:", error);
            showInfoBanner("Erro ao carregar tarefas para associar ao sprint.", "error-banner");
        }
    });
}
function handleSprintTaskUnlink(sprint) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allTasks = yield TaskService.getTasks();
            const sprintTaskRelations = yield SprintTaskService.getSprintTasks();
            const sprintRelations = sprintTaskRelations.filter((relation) => relation.sprint_id === sprint.id);
            if (sprintRelations.length === 0) {
                showInfoBanner("Este sprint não tem tarefas associadas.", "warning-banner");
                return;
            }
            const associatedTasks = sprintRelations
                .map((relation) => ({
                relation,
                task: allTasks.find((task) => { var _a, _b; return ((_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id) === relation.task_id; }),
            }))
                .filter((item) => item.task);
            if (associatedTasks.length === 0) {
                showInfoBanner("Não foi possível encontrar tarefas associadas a este sprint.", "warning-banner");
                return;
            }
            yield renderSprintTaskSelectionModal(sprint, associatedTasks, "unlink");
        }
        catch (error) {
            console.error("Erro ao carregar tarefas para desassociar do sprint:", error);
            showInfoBanner("Erro ao carregar tarefas para desassociar do sprint.", "error-banner");
        }
    });
}
function getTaskLabel(task) {
    var _a, _b, _c, _d;
    return (task.title ||
        task.name ||
        ((_a = task.getTitle) === null || _a === void 0 ? void 0 : _a.call(task)) ||
        ((_b = task.getName) === null || _b === void 0 ? void 0 : _b.call(task)) ||
        `Tarefa ${(_d = (_c = task.getId) === null || _c === void 0 ? void 0 : _c.call(task)) !== null && _d !== void 0 ? _d : task.id}`);
}
function renderSprintTaskSelectionModal(sprint, items, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const modal = document.createElement("section");
        modal.className = "modal sprint-task-selection-modal";
        modal.id = `sprintTaskSelectionModal-${sprint.id}-${mode}`;
        const content = document.createElement("div");
        content.className = "modal-content";
        content.style.maxWidth = "600px";
        content.style.width = "100%";
        const title = document.createElement("h2");
        title.textContent =
            mode === "link"
                ? "Selecionar tarefa para associar ao sprint"
                : "Selecionar tarefa para desassociar do sprint";
        const list = document.createElement("div");
        list.className = "sprint-task-selection-list";
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.style.gap = "0.5rem";
        items.forEach((item) => {
            const task = mode === "unlink" ? item.task : item;
            const relation = item.relation;
            const row = document.createElement("div");
            row.className = "sprint-task-selection-row";
            row.style.display = "flex";
            row.style.gap = "0.5rem";
            row.style.alignItems = "center";
            row.style.padding = "0.5rem";
            row.style.borderBottom = "1px solid #e0e0e0";
            const label = document.createElement("span");
            label.textContent = getTaskLabel(task);
            label.style.flex = "1";
            label.style.fontSize = "0.95rem";
            const button = document.createElement("button");
            button.className = "btn primary";
            button.innerHTML =
                mode === "link"
                    ? `<i class="fas fa-plus"></i>`
                    : `<i class="fas fa-minus"></i>`;
            button.title = mode === "link" ? "Associar tarefa" : "Desassociar tarefa";
            button.setAttribute("aria-label", mode === "link" ? "Associar tarefa" : "Desassociar tarefa");
            button.style.whiteSpace = "nowrap";
            button.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                e.stopPropagation();
                try {
                    if (mode === "link") {
                        yield SprintTaskService.createSprintTask(sprint.id, {
                            sprint_id: sprint.id,
                            task_id: (_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id,
                        });
                        showInfoBanner(`Tarefa "${getTaskLabel(task)}" associada ao sprint "${sprint.name}" com sucesso.`, "success-banner");
                    }
                    else {
                        yield SprintTaskService.deleteSprintTask(relation.sprint_id, relation.task_id);
                        showInfoBanner(`Tarefa "${getTaskLabel(task)}" desassociada do sprint "${sprint.name}" com sucesso.`, "success-banner");
                    }
                    modal.remove();
                    // Aguardar um pouco para garantir que o backend processou a mudança
                    yield new Promise((resolve) => setTimeout(resolve, 300));
                    // Verificar se estamos no dashboard do projeto
                    const dashboardElement = document.querySelector("#dashboardProject");
                    if (dashboardElement) {
                        // Estamos no dashboard do projeto, recarregar apenas a seção de sprints
                        const projectId = sprint.project_id;
                        const sprintsSection = dashboardElement.querySelector(".sprints-section");
                        if (sprintsSection && projectId) {
                            // Recarregar apenas a seção de sprints do projeto
                            const { createSprintsSection } = yield import("../projects/index.js");
                            const newSprintsSection = yield createSprintsSection(projectId);
                            sprintsSection.replaceWith(newSprintsSection);
                            return;
                        }
                    }
                    const currentSprints = yield SprintService.getSprints();
                    yield loadSprintsPage(currentSprints);
                }
                catch (error) {
                    console.error(error);
                    showInfoBanner("Erro ao atualizar a associação da tarefa.", "error-banner");
                }
            }));
            row.append(label, button);
            list.appendChild(row);
        });
        content.append(title, list);
        modal.appendChild(content);
        document.body.appendChild(modal);
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });
    });
}
