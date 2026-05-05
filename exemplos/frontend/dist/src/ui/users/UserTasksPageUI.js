var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TaskAssigneeService, TaskService, UserService, ProjectService, } from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { showTasksCounters } from "../tasks/index.js";
import { renderTaskModal } from "../modal/index.js";
import { removeAllCompletedTask, sortTasksByTitle, } from "../gestUserTask/index.js";
import { addElementInContainer, createSection, createHeadingTitle, createStatisticsCounter, createSearchContainer, clearContainer, } from "../dom/index.js";
import { createNotificationsUI } from "../notifications/index.js";
import { renderDashboard } from "../dashboard/index.js";
import { styleTransparentButton, } from "../dom/buttonStyles.js";
/* Lista de tarefas de utilizador obtidas da API */
export function loadUserTasksPage(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        try {
            const user = yield UserService.getUserById(userId);
            if (!user) {
                showInfoBanner("Utilizador não encontrado", "error-banner");
                return;
            }
            // Adicionar título
            addElementInContainer("#containerSection", createHeadingTitle("h2", `TAREFAS DE ${user.getName().toUpperCase()}`));
            // Obter atribuições de tarefas do utilizador
            const assigneesTasks = yield TaskAssigneeService.getTaskAssigneesByUserId(userId);
            // Obter detalhes das tarefas atribuídas
            const tasks = [];
            for (const assignee of assigneesTasks) {
                try {
                    const task = yield TaskService.getTaskById(assignee.task_id);
                    tasks.push(task);
                }
                catch (error) {
                    console.warn(`Tarefa com ID ${assignee.task_id} não encontrada, pulando...`);
                }
            }
            // Adicionar notificações
            addElementInContainer("#containerSection", yield createNotificationsUI(user));
            if (tasks.length === 0) {
                showInfoBanner("Este utilizador não tem tarefas atribuídas", "info-banner");
                return;
            }
            // Criar e adicionar contadores de tarefas
            const taskCounterSection = createTaskCounter("taskCounters");
            addElementInContainer("#containerSection", taskCounterSection);
            // Atualizar contadores
            yield showTasksCounters("tarefas", tasks);
            // Criar e adicionar container de busca
            const searchContainer = showSearchContainer();
            addElementInContainer("#containerSection", searchContainer);
            // Renderizar dashboard com as tarefas
            yield renderDashboard(tasks, user);
            // Adicionar event listeners aos botões de contador para filtrar
            setupCounterButtons(taskCounterSection, tasks);
            yield setupActionButtons(tasks, user);
        }
        catch (error) {
            console.error("Erro ao carregar tarefas do utilizador:", error);
            showInfoBanner("Erro ao carregar tarefas do utilizador. Por favor, tente novamente.", "error-banner");
        }
    });
}
/* Configurar event listeners dos botões de contador */
function setupCounterButtons(taskCounterSection, tasks) {
    const allTasksBtn = taskCounterSection.querySelector("#allTasksBtn");
    allTasksBtn.title = "Mostrar todas as tarefas";
    const pendingTaskBtn = taskCounterSection.querySelector("#pendingTaskBtn");
    pendingTaskBtn.title = "Mostrar tarefas pendentes";
    const completedTaskBtn = taskCounterSection.querySelector("#completedTaskBtn");
    completedTaskBtn.title = "Mostrar tarefas concluídas";
    allTasksBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        clearContainer("#tasksContainer");
        yield showTasksCounters("tarefas", tasks);
    }));
    pendingTaskBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const tasksPending = tasks.filter((task) => !task.getCompleted());
        clearContainer("#tasksContainer");
        yield showTasksCounters("pendentes", tasksPending);
    }));
    completedTaskBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const tasksCompleted = tasks.filter((task) => task.getCompleted());
        clearContainer("#tasksContainer");
        yield showTasksCounters("concluídas", tasksCompleted);
    }));
}
/* Configurar event listeners dos botões de ação */
function setupActionButtons(tasks, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const addTasksBtn = document.querySelector("#addTasksBtn");
        if (addTasksBtn) {
            addTasksBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Procurar um projeto padrão ou usar o primeiro disponível
                    const projects = yield ProjectService.getProjects();
                    const projectId = projects.length > 0 ? projects[0].getId() : 1;
                    yield renderTaskModal(projectId, undefined, user, () => __awaiter(this, void 0, void 0, function* () {
                        // Callback após sucesso - recarregar tarefas
                        yield loadUserTasksPage(user.getId());
                    }));
                }
                catch (error) {
                    console.error("Erro ao abrir modal de tarefa:", error);
                    showInfoBanner("Erro ao abrir formulário de tarefa", "error-banner");
                }
            }));
        }
        else {
            console.warn("Elemento #addTasksBtn não foi renderizado no DOM.");
        }
        const sortTasksBtn = document.querySelector("#sortTasksBtn");
        if (sortTasksBtn) {
            let isAscending = true;
            sortTasksBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const sortedTasks = yield sortTasksByTitle(isAscending);
                isAscending = !isAscending;
                clearContainer("#tasksContainer");
                yield showTasksCounters("filtradas", sortedTasks);
                sortTasksBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
            }));
        }
        else {
            console.warn("Elemento #sortTasksBtn não foi renderizado no DOM.");
        }
        // Adicionar event listeners ao input de busca
        const searchTaskInput = document.querySelector("#searchTask");
        if (searchTaskInput) {
            searchTaskInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const searchTerm = searchTaskInput.value.toLowerCase();
                if (searchTerm.trim() === "") {
                    clearContainer("#tasksContainer");
                    yield showTasksCounters("tarefas", tasks);
                }
                else {
                    const filteredSearchTasks = tasks.filter((task) => task.getTitle().toLowerCase().includes(searchTerm));
                    clearContainer("#tasksContainer");
                    yield showTasksCounters("filtradas", filteredSearchTasks);
                }
            }));
        }
        else {
            console.warn("Elemento de busca de tarefas não encontrado.");
        }
        // Adicionar event listener ao botão de remover tarefas concluídas
        const removeAllCompletedTaskBtn = document.querySelector("#removeAllCompletedTaskBtn");
        if (removeAllCompletedTaskBtn) {
            removeAllCompletedTaskBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const remainingTasks = yield removeAllCompletedTask();
                clearContainer("#tasksContainer");
                yield showTasksCounters("tarefas", remainingTasks);
            }));
        }
        else {
            console.warn("Elemento #removeAllCompletedTaskBtn não foi renderizado no DOM.");
        }
    });
}
/* */
export function showSearchContainer() {
    const searchTaskContainer = createSearchContainer("searchTaskContainer", { id: "searchTask", placeholder: "Procurar tarefa..." }, [
        { id: "addTasksBtn", text: "Adicionar Tarefa" },
        { id: "sortTasksBtn", text: "Ordenar A-Z" },
    ]);
    searchTaskContainer.classList.add("search-add-container");
    // Adicionar botão de remover concluídas
    const removeAllCompletedTaskBtn = document.createElement("button");
    removeAllCompletedTaskBtn.id = "removeAllCompletedTaskBtn";
    removeAllCompletedTaskBtn.className = "btn danger";
    removeAllCompletedTaskBtn.innerHTML = `<i class="fas fa-trash"></i> Limpar Concluídas`;
    removeAllCompletedTaskBtn.title = "Remover todas as tarefas concluídas";
    styleTransparentButton(removeAllCompletedTaskBtn, "#dc3545", "white");
    searchTaskContainer.appendChild(removeAllCompletedTaskBtn);
    return searchTaskContainer;
}
/* */
function createTaskCounter(id) {
    //
    const allTasksBtn = createStatisticsCounter("allTaskSection", "allTasksBtn", "./src/assets/tarefa.png", "tarefas", "allTasksCounter");
    //
    const pendingTaskBtn = createStatisticsCounter("pendingTaskSection", "pendingTaskBtn", "./src/assets/pendente.png", "pendentes", "pendingTasksCounter");
    //
    const completedTaskBtn = createStatisticsCounter("completedTaskSection", "completedTaskBtn", "./src/assets/tarefa-concluida.png", "concluídos", "completedTaskCounter");
    const sectionTasksCounter = createSection(`${id}`);
    sectionTasksCounter.classList.add("tasks-counters");
    sectionTasksCounter.append(allTasksBtn, pendingTaskBtn, completedTaskBtn);
    return sectionTasksCounter;
}
