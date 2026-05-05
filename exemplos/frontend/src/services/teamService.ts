import { TeamDTORequest, TeamStatsDTORequest, TeamMemberDTORequest } from "../api/dto/typesDTO.js";
import * as fetchTeams from "../api/index.js";

/* ============================================
   TEAMS
   ============================================ */

/* Serviço para gerenciar equipes */
export class TeamService {
  /* Função para obter a lista de equipes */
  static async getTeams(): Promise<TeamDTORequest[]> {
    return await fetchTeams.getTeams();
  }

  /* Função para obter uma equipe por ID */
  static async getTeamById(id: number): Promise<TeamDTORequest | null> {
    return await fetchTeams.getTeamById(id);
  }

  /* Função para criar uma nova equipe */
  static async createTeam(team: TeamDTORequest): Promise<TeamDTORequest | null> {
    return await fetchTeams.createTeam(team);
  }

  /* Função para atualizar uma equipe existente */
  static async updateTeam(id: number, team: TeamDTORequest): Promise<TeamDTORequest | null> {
    return await fetchTeams.updateTeam(id, team);
  }

  /* Função para excluir uma equipe */
  static async deleteTeam(id: number): Promise<boolean> {
    return await fetchTeams.deleteTeam(id);
  }

  /* Função para obter estatísticas globais de equipes */
  static async getTeamsStats(): Promise<TeamStatsDTORequest | null> {
    return await fetchTeams.getTeamsStats();
  }

  /* Função para obter estatísticas de uma equipe */
  static async getTeamStats(id: number): Promise<TeamStatsDTORequest | null> {
    return await fetchTeams.getTeamStats(id);
  }
}

/* ============================================
   TEAM MEMBERS
   ============================================ */

/* Serviço para gerenciar membros de equipe */
export class TeamMemberService {
  /* Função para obter a lista de membros de equipe */
  static async getTeamMembers(teamId: number): Promise<TeamMemberDTORequest[]> {
    return await fetchTeams.getTeamMembers(teamId);
  }

  /* Função para obter um membro de equipe por ID */
  static async getTeamMemberById(teamId: number, userId: number): Promise<TeamMemberDTORequest | null> {
    return await fetchTeams.getTeamMemberById(teamId, userId);
  }

  /* Função para criar um novo membro de equipe */
  static async createTeamMember(teamId: number, member: Partial<TeamMemberDTORequest>): Promise<TeamMemberDTORequest | null> {
    return await fetchTeams.createTeamMember(teamId, member);
  }

  /* Função para atualizar um membro de equipe existente */
  static async updateTeamMember(teamId: number, userId: number, member: Partial<TeamMemberDTORequest>): Promise<TeamMemberDTORequest | null> {
    return await fetchTeams.updateTeamMember(teamId, userId, member);
  }

  /* Função para excluir um membro de equipe */
  static async deleteTeamMember(teamId: number, userId: number): Promise<boolean> {
    return await fetchTeams.deleteTeamMember(teamId, userId);
  }
}
