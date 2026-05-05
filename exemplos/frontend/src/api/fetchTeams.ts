import { get, getById, create, put, remove, request } from "./index.js";
import { TeamDTORequest, TeamStatsDTORequest, TeamMemberDTORequest } from "./dto/index.js";

const ENDPOINT = "teams";

/* ============================================
   TEAMS
   ============================================ */

/* Função para obter a lista de equipes */
export async function getTeams(
  sort?: string,
  search?: string,
): Promise<TeamDTORequest[]> {
  return get<TeamDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma equipe por ID */
export async function getTeamById(id: number): Promise<TeamDTORequest | null> {
  return getById<TeamDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova equipe */
export async function createTeam(
  team: Partial<TeamDTORequest>,
): Promise<TeamDTORequest | null> {
  return create<TeamDTORequest>(ENDPOINT, team);
}

/* Função para atualizar uma equipe */
export async function updateTeam(
  id: number,
  team: Partial<TeamDTORequest>,
): Promise<TeamDTORequest | null> {
  return put<TeamDTORequest>(ENDPOINT, id, team);
}

/* Função para deletar uma equipe */
export async function deleteTeam(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

/* Função para obter estatísticas globais de equipes */
export async function getTeamsStats(): Promise<TeamStatsDTORequest | null> {
  const stats = await get<TeamStatsDTORequest>(ENDPOINT + "/stats");
  return stats ? stats[0] || null : null;
}

/* Função para obter estatísticas de uma equipe */
export async function getTeamStats(id: number): Promise<TeamStatsDTORequest | null> {
  const stats = await get<TeamStatsDTORequest>(ENDPOINT + `/${id}/stats`);
  return stats ? stats[0] || null : null;
}

/* ============================================
   TEAM MEMBERS
   ============================================ */

/* Função para obter a lista de membros de equipe */
export async function getTeamMembers(
  teamId: number,
): Promise<TeamMemberDTORequest[]> {
  return get<TeamMemberDTORequest>(`${ENDPOINT}/${teamId}/members`);
}

/* Função para obter um membro de equipe por ID */
export async function getTeamMemberById(
  teamId: number,
  userId: number,
): Promise<TeamMemberDTORequest | null> {
  return request<TeamMemberDTORequest>(`${ENDPOINT}/${teamId}/members/${userId}`, {
    method: "GET",
  });
}

/* Função para criar um novo membro de equipe */
export async function createTeamMember(
  teamId: number,
  member: Partial<TeamMemberDTORequest>,
): Promise<TeamMemberDTORequest | null> {
  return request<TeamMemberDTORequest>(`${ENDPOINT}/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(member),
  });
}

/* Função para atualizar um membro de equipe */
export async function updateTeamMember(
  teamId: number,
  userId: number,
  member: Partial<TeamMemberDTORequest>,
): Promise<TeamMemberDTORequest | null> {
  return request<TeamMemberDTORequest>(
    `${ENDPOINT}/${teamId}/members/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    }
  );
}

/* Função para deletar um membro de equipe */
export async function deleteTeamMember(teamId: number, userId: number): Promise<boolean> {
  const result = await request(
    `${ENDPOINT}/${teamId}/members/${userId}`,
    {
      method: "DELETE",
    }
  );
  return result !== null;
}

