import { TeamService } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadTeamsPage } from "../teams/index.js";

/* Função principal para mostrar as equipes */
export async function loadInitialTeams(): Promise<void> {
  // Limpa o container antes de mostrar as equipes
  clearContainer("#containerSection");
  // carrega a pagina dinamica de equipes
  const teams = await TeamService.getTeams();
  loadTeamsPage(teams);
}
