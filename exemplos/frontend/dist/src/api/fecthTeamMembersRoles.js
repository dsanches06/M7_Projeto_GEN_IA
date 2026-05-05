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
const ENDPOINT = "team_members_roles";
/* Função para obter a lista de membros de equipe */
export function getTeamMemberRoles(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma role de membro de equipe específica por ID */
export function getTeamMemberRoleById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova role de membro de equipe */
export function createTeamMemberRole(teamMemberRole) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, teamMemberRole);
    });
}
/* Função para atualizar uma role de membro de equipe existente */
export function updateTeamMemberRole(id, teamMemberRole) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, teamMemberRole);
    });
}
/* Função para excluir uma role de membro de equipe por ID */
export function deleteTeamMemberRole(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
