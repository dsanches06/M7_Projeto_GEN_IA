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
const ENDPOINT = "project_permissions";
/* Função para obter a lista de permissões de projeto */
export function getProjectPermissions(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma permissão de projeto por ID */
export function getProjectPermissionById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova permissão de projeto */
export function createProjectPermission(permission) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, permission);
    });
}
/* Função para atualizar uma permissão de projeto */
export function updateProjectPermission(id, permission) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, permission);
    });
}
/* Função para deletar uma permissão de projeto */
export function deleteProjectPermission(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
