var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchProjectStatus from "../api/fetchProjectStatus.js";
/* Serviço para gerenciar status de projetos */
export class ProjectStatusService {
    /* Função para obter a lista de status de projetos */
    static getProjectStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.getProjectStatuses();
        });
    }
    /* Função para obter um status de projeto por ID */
    static getProjectStatusById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.getProjectStatusById(id);
        });
    }
    /* Função para criar um novo status de projeto */
    static createProjectStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.createProjectStatus(status);
        });
    }
    /* Função para atualizar um status de projeto existente */
    static updateProjectStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.updateProjectStatus(id, status);
        });
    }
    /* Função para excluir um status de projeto */
    static deleteProjectStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.deleteProjectStatus(id);
        });
    }
}
