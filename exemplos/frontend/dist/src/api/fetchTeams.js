var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove, request } from "./index.js";
const ENDPOINT = "teams";
/* ============================================
   TEAMS
   ============================================ */
/* Função para obter a lista de equipes */
export function getTeams(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma equipe por ID */
export function getTeamById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova equipe */
export function createTeam(team) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, team);
    });
}
/* Função para atualizar uma equipe */
export function updateTeam(id, team) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, team);
    });
}
/* Função para deletar uma equipe */
export function deleteTeam(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
/* Função para obter estatísticas globais de equipes */
export function getTeamsStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + "/stats");
        return stats ? stats[0] || null : null;
    });
}
/* Função para obter estatísticas de uma equipe */
export function getTeamStats(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + `/${id}/stats`);
        return stats ? stats[0] || null : null;
    });
}
/* ============================================
   TEAM MEMBERS
   ============================================ */
/* Função para obter a lista de membros de equipe */
export function getTeamMembers(teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/${teamId}/members`);
    });
}
/* Função para obter um membro de equipe por ID */
export function getTeamMemberById(teamId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${teamId}/members/${userId}`, {
            method: "GET",
        });
    });
}
/* Função para criar um novo membro de equipe */
export function createTeamMember(teamId, member) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${teamId}/members`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(member),
        });
    });
}
/* Função para atualizar um membro de equipe */
export function updateTeamMember(teamId, userId, member) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${teamId}/members/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(member),
        });
    });
}
/* Função para deletar um membro de equipe */
export function deleteTeamMember(teamId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield request(`${ENDPOINT}/${teamId}/members/${userId}`, {
            method: "DELETE",
        });
        return result !== null;
    });
}
