var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCardBorderColor, setCardBorderColor, showConfirmDialog, showInfoBanner, } from "../../helpers/index.js";
import { loadTaskDetailPage } from "./index.js";
import { loadTasksPage } from "./index.js";
import { renderTaskModal } from "../modal/index.js";
import { renderProjectDashboard } from "../projects/ProjectDashboardUI.js";
import { activateMenu, createSection } from "../dom/index.js";
import { TaskService, TagService, UserService, } from "../../services/index.js";
export function createTaskCard(task, userMap) {
    return __awaiter(this, void 0, void 0, function* () {
        const assigneeName = getAssigneeNameFromMap(task, userMap);
        return yield buildTaskCard(task, assigneeName);
    });
}
export function renderTaskCards(tasks) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = createSection("taskCardsContainer");
        container.classList.add("grid-card-container");
        for (const task of tasks) {
            const taskCard = yield createTaskCardElement(task);
            container.appendChild(taskCard);
        }
        return container;
    });
}
function createTaskCardElement(task) {
    return __awaiter(this, void 0, void 0, function* () {
        const assigneeName = yield getAssigneeNameRemote(task);
        return yield buildTaskCard(task, assigneeName);
    });
}
function getAssigneeNameFromMap(task, userMap) {
    var _a;
    const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
    if (assignees.length === 0) {
        return "Sem atribuição";
    }
    const firstAssignee = assignees[0];
    const user = userMap.get(firstAssignee.user_id);
    return user ? user.getName().split(" ")[0] : "Sem atribuição";
}
function getAssigneeNameRemote(task) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
        if (assignees.length === 0) {
            return "Sem atribuição";
        }
        const firstAssignee = assignees[0];
        try {
            const allUsers = yield UserService.getUsers();
            const user = allUsers.find((user) => user.getId() === firstAssignee.user_id);
            return user ? user.getName().split(" ")[0] : "Sem atribuição";
        }
        catch (error) {
            showInfoBanner("Erro ao carregar informações do utilizador.", "error-banner");
            return "Sem atribuição";
        }
    });
}
function buildTaskCard(task, assigneeName) {
    return __awaiter(this, void 0, void 0, function* () {
        const card = document.createElement("div");
        card.className = "task-card";
        card.setAttribute("data-task-id", task.getId().toString());
        card.style.display = "flex";
        card.style.gap = "1rem";
        card.style.alignItems = "flex-start";
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "task-card-content";
        contentWrapper.style.flex = "1";
        // Número/id
        const number = document.createElement("span");
        number.className = "number";
        number.textContent = task.getId().toString();
        // Título
        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.getTitle();
        // Responsável
        const user = document.createElement("span");
        user.className = "task-user";
        user.textContent = assigneeName;
        // Status
        const status = document.createElement("span");
        status.className = "task-status";
        status.textContent = task.getStatus();
        // Tags
        let tagsWrapper = null;
        try {
            const tags = yield TaskService.getTaskTags(task.getId());
            if (tags.length > 0) {
                tagsWrapper = document.createElement("div");
                tagsWrapper.className = "task-tags";
                tags.forEach((tag) => {
                    const tagPill = document.createElement("span");
                    tagPill.className = "task-tag-pill";
                    tagPill.textContent = tag.name || "Tag";
                    tagsWrapper.appendChild(tagPill);
                });
            }
        }
        catch (error) {
            console.error("Erro ao carregar tags da tarefa:", error);
        }
        // Por padrão, só mostra número, título e botão toggle
        contentWrapper.append(number, title, user, status);
        if (tagsWrapper) {
            contentWrapper.appendChild(tagsWrapper);
        }
        // Botões (direita)
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.style.display = "flex";
        buttonContainer.style.flexDirection = "column";
        buttonContainer.style.gap = "0.35rem";
        buttonContainer.style.alignItems = "flex-end";
        buttonContainer.style.flexShrink = "0";
        // Botões de ação
        const editBtn = document.createElement("button");
        editBtn.className = "icon-button";
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
        editBtn.title = "Editar tarefa";
        editBtn.setAttribute("aria-label", "Editar tarefa");
        editBtn.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            const projectId = getTaskProjectId(task);
            if (projectId) {
                yield renderTaskModal(projectId, task, undefined, () => __awaiter(this, void 0, void 0, function* () {
                    activateMenu("#menuTasks");
                    yield loadTasksPage();
                }));
            }
            else {
                showInfoBanner("Não foi possível obter o ID do projeto.", "error-banner");
            }
        }));
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "icon-button";
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        deleteBtn.title = "Excluir tarefa";
        deleteBtn.setAttribute("aria-label", "Excluir tarefa");
        deleteBtn.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            const confirmed = yield showConfirmDialog(`Tem certeza que deseja excluir a tarefa \"${task.getTitle()}\"?`);
            if (!confirmed) {
                return;
            }
            try {
                yield TaskService.deleteTask(task.getId());
                showInfoBanner("Tarefa excluída com sucesso.", "success-banner");
                // Verificar se está no dashboard do projeto
                const dashboardElement = document.querySelector("#dashboardProject");
                if (dashboardElement) {
                    // Se está no dashboard, recarregar o dashboard
                    const projectId = getTaskProjectId(task);
                    if (projectId) {
                        const projectDashboard = yield renderProjectDashboard(projectId);
                        dashboardElement.replaceWith(projectDashboard);
                    }
                }
                else {
                    // Caso contrário, carregar página de tarefas
                    activateMenu("#menuTasks");
                    yield loadTasksPage();
                }
            }
            catch (error) {
                showInfoBanner("Erro ao excluir tarefa", "error-banner");
                showInfoBanner("Erro ao excluir a tarefa.", "error-banner");
                console.error(error);
            }
        }));
        const addTagBtn = document.createElement("button");
        addTagBtn.className = "icon-button";
        addTagBtn.innerHTML = `<i class="fas fa-tags"></i><i class="fa-sharp fa-solid fa-plus"></i>`;
        addTagBtn.title = "Adicionar tag";
        addTagBtn.setAttribute("aria-label", "Adicionar tag");
        addTagBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield renderTaskTagModal(task, "add");
        }));
        const deleteTagBtn = document.createElement("button");
        deleteTagBtn.className = "icon-button";
        deleteTagBtn.innerHTML = `<i class="fas fa-tags"></i><i class="fa-sharp fa-solid fa-minus"></i>`;
        deleteTagBtn.title = "Remover tag";
        deleteTagBtn.setAttribute("aria-label", "Remover tag");
        deleteTagBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield renderTaskTagModal(task, "remove");
        }));
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        buttonContainer.appendChild(addTagBtn);
        buttonContainer.appendChild(deleteTagBtn);
        // Monta a linha principal: conteúdo à esquerda, botões à direita
        card.append(contentWrapper, buttonContainer);
        setCardBorderColor(card, getCardBorderColor(task.getStatus()));
        card.addEventListener("click", (event) => {
            const target = event.target;
            if (target.closest(".icon-button")) {
                return;
            }
            loadTaskDetailPage(task.getId());
        });
        return card;
    });
}
function renderTaskTagModal(task, action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const taskId = task.getId();
            const allTags = yield TagService.getTags();
            const taskTags = yield TaskService.getTaskTags(taskId);
            const taskTagIds = new Set(taskTags.map((tag) => tag.id));
            const availableTags = action === "add"
                ? allTags.filter((tag) => !taskTagIds.has(tag.id))
                : taskTags;
            const modal = document.createElement("section");
            modal.className = "modal";
            modal.id = `taskTagModal-${taskId}-${action}`;
            const content = document.createElement("div");
            content.className = "modal-content";
            content.style.maxWidth = "600px";
            content.style.width = "100%";
            content.style.padding = "1rem";
            const title = document.createElement("h2");
            title.textContent =
                action === "add"
                    ? "Selecionar tag para adicionar à tarefa"
                    : "Selecionar tag para remover da tarefa";
            const list = document.createElement("div");
            list.className = "task-tag-selection-list";
            list.style.display = "flex";
            list.style.flexDirection = "column";
            list.style.gap = "0.5rem";
            list.style.maxHeight = "400px";
            list.style.overflowY = "auto";
            availableTags.forEach((tag) => {
                const row = document.createElement("div");
                row.className = "task-tag-selection-row";
                row.style.display = "flex";
                row.style.gap = "0.5rem";
                row.style.alignItems = "center";
                row.style.padding = "0.5rem";
                row.style.borderBottom = "1px solid #e0e0e0";
                const label = document.createElement("span");
                label.textContent = tag.name;
                label.style.flex = "1";
                label.style.fontSize = "0.95rem";
                const button = document.createElement("button");
                button.className = "btn primary";
                button.innerHTML =
                    action === "add"
                        ? `<i class="fas fa-plus"></i>`
                        : `<i class="fas fa-minus"></i>`;
                button.title = action === "add" ? "Adicionar tag" : "Remover tag";
                button.setAttribute("aria-label", action === "add" ? "Adicionar tag" : "Remover tag");
                button.style.whiteSpace = "nowrap";
                button.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                    e.stopPropagation();
                    try {
                        if (action === "add") {
                            yield TaskService.addTagToTask(taskId, {
                                task_id: taskId,
                                tag_id: tag.id,
                            });
                            showInfoBanner(`Tag "${tag.name}" adicionada à tarefa.`, "success-banner");
                        }
                        else {
                            yield TaskService.removeTagFromTask(taskId, tag.id);
                            showInfoBanner(`Tag "${tag.name}" removida da tarefa.`, "success-banner");
                        }
                        modal.remove();
                        // Aguardar um pouco para garantir que o backend processou a mudança
                        yield new Promise(resolve => setTimeout(resolve, 300));
                        activateMenu("#menuTasks");
                        yield loadTasksPage();
                    }
                    catch (error) {
                        showInfoBanner("Erro ao atualizar tag da tarefa.", "error-banner");
                        console.error("Erro ao atualizar tag da tarefa:", error);
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
        }
        catch (error) {
            showInfoBanner("Erro ao abrir o modal de tags.", "error-banner");
            console.error("Erro ao renderizar modal de tags:", error);
        }
    });
}
function getTaskProjectId(task) {
    var _a, _b;
    const project = (_a = task.getProject) === null || _a === void 0 ? void 0 : _a.call(task);
    if (project && typeof project.getId === "function") {
        return project.getId();
    }
    const anyTask = task;
    return anyTask.project_id || ((_b = anyTask.project) === null || _b === void 0 ? void 0 : _b.id) || null;
}
