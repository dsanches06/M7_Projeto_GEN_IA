var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove } from "./index.js";
const ENDPOINT = "project_status";
/* Função para obter a lista de status de projeto */
export function getProjectStatuses(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um status de projeto por ID */
export function getProjectStatusById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo status de projeto */
export function createProjectStatus(status) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, status);
    });
}
/* Função para atualizar um status de projeto */
export function updateProjectStatus(id, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, status);
    });
}
/* Função para deletar um status de projeto */
export function deleteProjectStatus(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
