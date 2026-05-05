import { TeamService } from "../../services/index.js";
import { TeamStatsDTORequest } from "../../api/dto/index.js";

export interface TeamStatsResponse {
  totalTeams: number;
}

export async function showTeamsCounters(
  type?: string,
  teams?: any[],
): Promise<void> {
  if (type === "filtradas" && teams) {
    await countAllTeams("#allTeamsCounter", teams.length);
    countFilterTeams("#filterTeamsCounter", type!, teams.length);
  } else {
    await countAllTeams("#allTeamsCounter");
    countFilterTeams("#filterTeamsCounter", type!);
  }
}

/* Contador de todas as equipes */
async function countAllTeams(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: TeamStatsDTORequest = (await TeamService.getTeamsStats())!;
  if (section) {
    section.textContent = `${stats.totalTeams}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de equipes filtradas */
function countFilterTeams(id: string, type: string, count?: number): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (count !== undefined) {
      section.textContent = `${count}`;
    } else {
      section.textContent = "0";
    }
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}
