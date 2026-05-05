import { get, getById, create, put, remove } from "./index.js";
import {TeamMemberRolesDTORequest } from "./dto/index.js";

const ENDPOINT = "team_members_roles";

/* Função para obter a lista de membros de equipe */
export async function getTeamMemberRoles(
  sort?: string,
  search?: string,
): Promise<TeamMemberRolesDTORequest[]> {
  return get<TeamMemberRolesDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma role de membro de equipe específica por ID */
export async function getTeamMemberRoleById(
  id: number,
): Promise<TeamMemberRolesDTORequest | null> {
  return getById<TeamMemberRolesDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova role de membro de equipe */
export async function createTeamMemberRole(
  teamMemberRole: Partial<TeamMemberRolesDTORequest>,
): Promise<TeamMemberRolesDTORequest | null> {
  return create<TeamMemberRolesDTORequest>(ENDPOINT, teamMemberRole);
}

/* Função para atualizar uma role de membro de equipe existente */
export async function updateTeamMemberRole(
  id: number,
  teamMemberRole: Partial<TeamMemberRolesDTORequest>,
): Promise<TeamMemberRolesDTORequest | null> {
  return put<TeamMemberRolesDTORequest>(ENDPOINT, id, teamMemberRole);
}

/* Função para excluir uma role de membro de equipe por ID */
export async function deleteTeamMemberRole(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}
