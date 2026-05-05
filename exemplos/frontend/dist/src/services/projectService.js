var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchProjects from "../api/fetchProjects.js";
import * as fetchProjectStatus from "../api/fetchProjectStatus.js";
/* Serviço para gerenciar projetos */
export class ProjectService {
    /* Função para obter a lista de projetos */
    static getProjects(sort, search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.getProjects(sort, search);
        });
    }
    /* Função para obter um projeto por ID */
    static getProjectById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.getProjectById(id);
        });
    }
    /* Função para criar um novo projeto */
    static createProject(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.createProject(project);
        });
    }
    /* Função para atualizar um projeto existente */
    static updateProject(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.updateProject(project);
        });
    }
    /* Função para atualizar parcialmente um projeto (datas, descrição, etc) */
    static partialUpdateProject(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.partialUpdateProject(id, updates);
        });
    }
    /* Função para excluir um projeto */
    static deleteProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.deleteProject(id);
        });
    }
    /* Função para obter os status disponíveis dos projetos */
    static getProjectStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectStatus.getProjectStatuses();
        });
    }
    /* Função para obter estatísticas globais de projetos */
    static getProjectsStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.getProjectsStats();
        });
    }
    /* Função para obter estatísticas de um projeto */
    static getProjectStats(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjects.getProjectStats(id);
        });
    }
}
