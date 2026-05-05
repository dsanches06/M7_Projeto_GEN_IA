var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTeamMembersRole from "../api/fecthTeamMembersRoles.js";
/* Serviço para gerenciar membros de equipe */
export class TeamMembersRolesService {
    /* Função para obter a lista de rroles dos membros de equipe */
    static getTeamMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeamMembersRole.getTeamMemberRoles();
        });
    }
    /* Função para obter um membro de equipe por ID */
    static getTeamMemberById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeamMembersRole.getTeamMemberRoleById(id);
        });
    }
    /* Função para criar um novo role demembro de equipe */
    static createTeamMemberRoles(member) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeamMembersRole.createTeamMemberRole(member);
        });
    }
    /* Função para atualizar um  role de membro de equipe existente */
    static updateTeamMemberRoles(id, member) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeamMembersRole.updateTeamMemberRole(id, member);
        });
    }
    /* Função para excluir um role de membro de equipe */
    static deleteTeamMember(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTeamMembersRole.deleteTeamMemberRole(id);
        });
    }
}
