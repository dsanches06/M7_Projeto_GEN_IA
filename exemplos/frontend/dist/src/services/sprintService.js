var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchSprints from "../api/index.js";
/* ============================================
   SPRINTS
   ============================================ */
/* Serviço para gerenciar sprints */
export class SprintService {
    /* Função para obter a lista de sprints */
    static getSprints(sort, search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.getSprints(sort, search);
        });
    }
    /* Função para obter um sprint por ID */
    static getSprintById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.getSprintById(id);
        });
    }
    /* Função para criar um novo sprint */
    static createSprint(sprint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.createSprint(sprint);
        });
    }
    /* Função para atualizar um sprint existente */
    static updateSprint(id, sprint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.updateSprint(id, sprint);
        });
    }
    /* Função para atualizar parcialmente um sprint (datas, descrição, etc) */
    static partialUpdateSprint(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.partialUpdateSprint(id, updates);
        });
    }
    /* Função para excluir um sprint */
    static deleteSprint(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.deleteSprint(id);
        });
    }
    /* Função para obter estatísticas globais de sprints */
    static getSprintsStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.getSprintsStats();
        });
    }
    /* Função para obter estatísticas de um sprint */
    static getSprintStats(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.getSprintStats(id);
        });
    }
}
/* ============================================
   SPRINT TASKS
   ============================================ */
/* Serviço para gerenciar tarefas de sprint */
export class SprintTaskService {
    /* Função para obter a lista de tarefas de sprint (todas ou de um sprint específico) */
    static getSprintTasks(sprintId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sprintId) {
                return yield fetchSprints.getSprintTasks(sprintId);
            }
            else {
                // Obter todas as relações de sprints-tasks
                return yield fetchSprints.getAllSprintTasks();
            }
        });
    }
    /* Função para obter uma tarefa de sprint por ID */
    static getSprintTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.getSprintTaskById(id);
        });
    }
    /* Função para criar uma nova tarefa de sprint */
    static createSprintTask(sprintId, sprintTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.createSprintTask(sprintId, sprintTask);
        });
    }
    /* Função para atualizar uma tarefa de sprint existente */
    static updateSprintTask(sprintId, taskId, sprintTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.updateSprintTask(sprintId, taskId, sprintTask);
        });
    }
    /* Função para excluir uma tarefa de sprint */
    static deleteSprintTask(sprintId, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchSprints.deleteSprintTask(sprintId, taskId);
        });
    }
}
