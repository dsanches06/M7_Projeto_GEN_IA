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
export function showTasksCounters(type, tasks) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((type === "tarefas" || type === "pendentes" || type === "concluídas" || type === "filtradas") &&
            tasks) {
            // Contar tarefas pendentes e concluídas no array fornecido
            const pendingCount = tasks.filter((t) => !t.getCompleted()).length;
            const completedCount = tasks.filter((t) => t.getCompleted()).length;
            // Sempre mostrar o total de tarefas do array
            yield countAllTasks("#allTasksCounter", tasks.length);
            yield countPendingTasks("#pendingTasksCounter", pendingCount);
            yield countCompletedTasks("#completedTaskCounter", completedCount);
            // Mostrar o filtro se não for "tarefas" (que é o estado padrão)
            if (type !== "tarefas") {
                countFilterTasks("#filterTasksCounter", type, tasks.length);
            }
            else {
                countFilterTasks("#filterTasksCounter", "");
            }
        }
        else {
            yield countAllTasks("#allTasksCounter");
            yield countPendingTasks("#pendingTasksCounter");
            yield countCompletedTasks("#completedTaskCounter");
            countFilterTasks("#filterTasksCounter", type);
        }
    });
}
/* Contador de tarefas pendentes */
function countPendingTasks(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield TaskService.getTaskStats());
        if (section) {
            section.textContent = `${stats.pendingTasks}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de tarefas concluídas */
function countCompletedTasks(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield TaskService.getTaskStats());
        if (section) {
            section.textContent = `${stats.completedTasks}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de tarefas filtradas */
function countFilterTasks(id, type, count) {
    const section = document.querySelector(`${id}`);
    if (section) {
        if (count !== undefined) {
            section.textContent = `${count}`;
        }
        else if (type === "filtradas" && section.textContent !== "") {
            section.textContent = `${0}`;
        }
        else {
            section.textContent = "0";
        }
    }
    else {
        console.warn(`Elemento ${id} não foi encontrado no DOM.`);
    }
}
/* Contador de todas as tarefas */
function countAllTasks(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield TaskService.getTaskStats());
        if (section) {
            section.textContent = `${stats.totalTasks}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
