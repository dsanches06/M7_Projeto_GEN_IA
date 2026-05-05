var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTeams from "../api/index.js";
/* ============================================
   TEAMS
   ============================================ */
/* Serviço para gerenciar equipes */
export class TeamService {
    /* Função para obter a lista de equipes */
    static getTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeams();
        });
    }
    /* Função para obter uma equipe por ID */
    static getTeamById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeamById(id);
        });
    }
    /* Função para criar uma nova equipe */
    static createTeam(team) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.createTeam(team);
        });
    }
    /* Função para atualizar uma equipe existente */
    static updateTeam(id, team) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.updateTeam(id, team);
        });
    }
    /* Função para excluir uma equipe */
    static deleteTeam(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.deleteTeam(id);
        });
    }
    /* Função para obter estatísticas globais de equipes */
    static getTeamsStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeamsStats();
        });
    }
    /* Função para obter estatísticas de uma equipe */
    static getTeamStats(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeamStats(id);
        });
    }
}
/* ============================================
   TEAM MEMBERS
   ============================================ */
/* Serviço para gerenciar membros de equipe */
export class TeamMemberService {
    /* Função para obter a lista de membros de equipe */
    static getTeamMembers(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeamMembers(teamId);
        });
    }
    /* Função para obter um membro de equipe por ID */
    static getTeamMemberById(teamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.getTeamMemberById(teamId, userId);
        });
    }
    /* Função para criar um novo membro de equipe */
    static createTeamMember(teamId, member) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.createTeamMember(teamId, member);
        });
    }
    /* Função para atualizar um membro de equipe existente */
    static updateTeamMember(teamId, userId, member) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.updateTeamMember(teamId, userId, member);
        });
    }
    /* Função para excluir um membro de equipe */
    static deleteTeamMember(teamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeams.deleteTeamMember(teamId, userId);
        });
    }
}
