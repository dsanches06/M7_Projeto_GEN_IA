var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TaskService } from "../../services/index.js";
import { showTasksCounters } from "./index.js";
import { TaskDashboardUI } from "./index.js";
import { addElementInContainer, createSection, createHeadingTitle, createStatisticsCounter, createSearchContainer, clearContainer, } from "../dom/index.js";
import { showConfirmDialog, showInfoBanner } from "../../helpers/index.js";
/* Lista de tarefas obtidas da API */
export function loadTasksPage() {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "VISÃO GERAL DE TAREFAS"));
        const taskCounterSection = createTaskCounter("taskCounters");
        addElementInContainer("#containerSection", taskCounterSection);
        const searchContainer = showSearchTaskContainer();
        addElementInContainer("#containerSection", searchContainer);
        // Carregar tarefas da API
        const tasks = yield TaskService.getTasks();
        // Renderizar dashboard com as tarefas
        const taskDashboard = new TaskDashboardUI();
        addElementInContainer("#containerSection", yield taskDashboard.loadAndRender());
        // Aguardar render do DOM antes de atualizar contadores
        yield new Promise((resolve) => setTimeout(resolve, 0));
        yield showTasksCounters("tarefas", tasks);
        // Event listener para busca de tarefas
        const searchTaskInput = document.querySelector("#searchTask");
        if (searchTaskInput) {
            searchTaskInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const searchTerm = searchTaskInput.value;
                const searchedTasks = yield TaskService.getTasks(undefined, searchTerm);
                yield showTasksCounters("filtradas", searchedTasks);
            }));
        }
        // Event listener para ordenar tarefas
        const sortTasksBtn = document.querySelector("#sortTasksBtn");
        if (sortTasksBtn) {
            let isAscending = true;
            sortTasksBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allTasks = yield TaskService.getTasks();
                const sortedTasks = allTasks.sort((a, b) => {
                    var _a, _b;
                    const aTitle = ((_a = a.getTitle) === null || _a === void 0 ? void 0 : _a.call(a)) || "";
                    const bTitle = ((_b = b.getTitle) === null || _b === void 0 ? void 0 : _b.call(b)) || "";
                    return isAscending
                        ? aTitle.localeCompare(bTitle)
                        : bTitle.localeCompare(aTitle);
                });
                isAscending = !isAscending;
                sortTasksBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
                yield showTasksCounters("filtradas", sortedTasks);
            }));
        }
        // Aguardar um pouco para garantir que o DOM foi renderizado
        yield new Promise((resolve) => setTimeout(resolve, 100));
        // Event listener para remover todas as tarefas concluídas
        const removeAllCompletedTaskBtn = document.querySelector("#removeAllCompletedTaskBtn");
        if (removeAllCompletedTaskBtn) {
            removeAllCompletedTaskBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const confirmed = yield showConfirmDialog("Tem certeza que deseja remover todas as tarefas concluídas?");
                if (confirmed) {
                    try {
                        const allTasks = yield TaskService.getTasks();
                        const completedTasks = allTasks.filter((task) => {
                            var _a;
                            const status = (_a = task.getStatus) === null || _a === void 0 ? void 0 : _a.call(task);
                            return (status === null || status === void 0 ? void 0 : status.toString().toLowerCase()) === "concluído";
                        });
                        for (const task of completedTasks) {
                            yield TaskService.deleteTask(task.getId());
                        }
                        showInfoBanner(`${completedTasks.length} tarefa(s) removida(s).`, "success-banner");
                        yield loadTasksPage();
                    }
                    catch (error) {
                        showInfoBanner("Erro ao remover tarefas concluídas.", "error-banner");
                        console.error(error);
                    }
                }
            }));
        }
    });
}
function createTaskCounter(id) {
    const allTasksBtn = createStatisticsCounter("allTaskSection", "allTasksBtn", "./src/assets/tarefa.png", "tarefas", "allTasksCounter");
    const pendingTaskBtn = createStatisticsCounter("pendingTaskSection", "pendingTaskBtn", "./src/assets/pendente.png", "pendentes", "pendingTasksCounter");
    const completedTaskBtn = createStatisticsCounter("completedTaskSection", "completedTaskBtn", "./src/assets/tarefa-concluida.png", "concluídos", "completedTaskCounter");
    const sectionTasksCounter = createSection(`${id}`);
    sectionTasksCounter.classList.add("tasks-counters");
    sectionTasksCounter.append(allTasksBtn, pendingTaskBtn, completedTaskBtn);
    return sectionTasksCounter;
}
function showSearchTaskContainer() {
    const searchTaskContainer = createSearchContainer("searchTaskContainer", { id: "searchTask", placeholder: "Procurar tarefa..." }, [
        { id: "sortTasksBtn", text: "Ordenar A-Z" },
        { id: "removeAllCompletedTaskBtn", text: "Limpar Concluídas" },
    ]);
    searchTaskContainer.classList.add("search-add-container");
    return searchTaskContainer;
}
