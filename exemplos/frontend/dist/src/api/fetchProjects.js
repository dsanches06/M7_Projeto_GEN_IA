var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, patch, remove } from "./index.js";
import { mapToProject } from "./dto/index.js";
const ENDPOINT = "projects";
/* Função para obter a lista de projetos */
export function getProjects(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield get(ENDPOINT, sort, search);
        return data.map((item) => mapToProject(item));
    });
}
/* Função para obter um projeto específico por ID */
export function getProjectById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getById(ENDPOINT, id);
        return data ? mapToProject(data) : null;
    });
}
/* Função para criar um novo projeto */
export function createProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield create(ENDPOINT, project);
        return data ? mapToProject(data) : null;
    });
}
/* Função para atualizar um projeto existente */
export function updateProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield put(ENDPOINT, project.id, project);
        return data ? mapToProject(data) : null;
    });
}
/* Função para atualizar parcialmente um projeto (datas, descrição, etc) */
export function partialUpdateProject(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield patch(ENDPOINT, id, updates);
        return result !== null;
    });
}
/* Função para excluir um projeto por ID */
export function deleteProject(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
/* Função para obter estatísticas globais de projetos */
export function getProjectsStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + "/stats");
        return stats ? stats[0] || null : null;
    });
}
/* Função para obter estatísticas de um projeto */
export function getProjectStats(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + `/${id}/stats`);
        return stats ? stats[0] || null : null;
    });
}
