var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchProjectPermissions from "../api/fetchProjectPermissions.js";
/* Serviço para gerenciar permissões de projeto */
export class ProjectPermissionService {
    /* Função para obter a lista de permissões de projeto */
    static getProjectPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectPermissions.getProjectPermissions();
        });
    }
    /* Função para obter uma permissão de projeto por ID */
    static getProjectPermissionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectPermissions.getProjectPermissionById(id);
        });
    }
    /* Função para criar uma nova permissão de projeto */
    static createProjectPermission(permission) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectPermissions.createProjectPermission(permission);
        });
    }
    /* Função para atualizar uma permissão de projeto existente */
    static updateProjectPermission(id, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectPermissions.updateProjectPermission(id, permission);
        });
    }
    /* Função para excluir uma permissão de projeto */
    static deleteProjectPermission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchProjectPermissions.deleteProjectPermission(id);
        });
    }
}
