import { TeamMemberRolesDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTeamMembersRole from "../api/fecthTeamMembersRoles.js";

/* Serviço para gerenciar membros de equipe */
export class TeamMembersRolesService {
  /* Função para obter a lista de rroles dos membros de equipe */
  static async getTeamMembers(): Promise<TeamMemberRolesDTORequest[]> {
    return await fetchTeamMembersRole.getTeamMemberRoles();
  }

  /* Função para obter um membro de equipe por ID */
  static async getTeamMemberById(id: number): Promise<TeamMemberRolesDTORequest | null> {
    return await fetchTeamMembersRole.getTeamMemberRoleById(id);
  }

  /* Função para criar um novo role demembro de equipe */
  static async createTeamMemberRoles(member: TeamMemberRolesDTORequest): Promise<TeamMemberRolesDTORequest | null> {
    return await fetchTeamMembersRole.createTeamMemberRole(member);
  }

  /* Função para atualizar um  role de membro de equipe existente */
  static async updateTeamMemberRoles(id: number, member: TeamMemberRolesDTORequest): Promise<TeamMemberRolesDTORequest | null> {
    return await fetchTeamMembersRole.updateTeamMemberRole(id, member);
  }

  /* Função para excluir um role de membro de equipe */
  static async deleteTeamMember(id: number): Promise<boolean> {
    return await fetchTeamMembersRole.deleteTeamMemberRole(id);
  }
}
