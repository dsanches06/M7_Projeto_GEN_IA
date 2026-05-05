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
import { clearContainer } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { loadTasksPage } from "../tasks/index.js";
// array global para armazenar tarefas filtradas
let tasksFiltered;
/* Função principal para mostrar as tarefas de todos os utilizadores */
export function loadAInitialTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        // Limpa o container antes de mostrar os utilizadores
        clearContainer("#containerSection");
        // carrega a pagina dinamica de utilizadores
        yield loadTasksPage();
    });
}
/* Ordenar tarefas por título obtendo dados da API */
export function sortTasksByTitle() {
    return __awaiter(this, arguments, void 0, function* (ascending = true) {
        try {
            const sort = ascending ? "asc" : "desc";
            const sortedTasks = yield TaskService.getTasks(sort);
            return sortedTasks || [];
        }
        catch (error) {
            console.error("Erro ao ordenar tarefas:", error);
            showInfoBanner("Erro ao ordenar tarefas. Por favor, tente novamente.", "error-banner");
            return [];
        }
    });
}
/* Procurar tarefas por título obtendo dados da API */
export function searchTasksByTitle(searchTerm) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return yield TaskService.getTasks();
            }
            tasksFiltered = yield TaskService.getTasks(undefined, searchTerm);
            return tasksFiltered || [];
        }
        catch (error) {
            console.error("Erro ao procurar tarefas:", error);
            showInfoBanner("Erro ao procurar tarefas. Por favor, tente novamente.", "error-banner");
            return [];
        }
    });
}
/* Remover todas as tarefas completadas via API */
export function removeAllCompletedTask() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obter todas as tarefas da API
            const allTasks = yield TaskService.getTasks();
            if (!allTasks || allTasks.length === 0) {
                showInfoBanner("Não existem tarefas para remover.", "info-banner");
                return [];
            }
            // Separar tarefas completadas e não completadas
            const completedTasks = allTasks.filter((task) => task.getCompleted());
            const pendingTasks = allTasks.filter((task) => !task.getCompleted());
            if (completedTasks.length === 0) {
                showInfoBanner("Não existem tarefas completadas para remover.", "info-banner");
                return pendingTasks;
            }
            // Deletar cada tarefa completada via API
            for (const task of completedTasks) {
                try {
                    yield TaskService.deleteTask(task.getId());
                }
                catch (error) {
                    console.error(`Erro ao deletar tarefa "${task.getTitle()}":`, error);
                }
            }
            const deletedCount = completedTasks.length;
            showInfoBanner(`${deletedCount} tarefa(s) completada(s) removida(s) com sucesso.`, "success-banner");
            tasksFiltered = pendingTasks;
            return pendingTasks;
        }
        catch (error) {
            console.error("Erro ao remover tarefas completadas:", error);
            showInfoBanner("Erro ao remover tarefas completadas. Por favor, tente novamente.", "error-banner");
            return [];
        }
    });
}
