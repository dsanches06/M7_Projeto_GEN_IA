import { SprintService } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadSprintsPage } from "../sprints/index.js";

/* Função principal para mostrar os sprints */
export async function loadInitialSprints(): Promise<void> {
  // Limpa o container antes de mostrar os sprints
  clearContainer("#containerSection");
  // carrega a pagina dinamica de sprints
  const sprints = await SprintService.getSprints();
  loadSprintsPage(sprints);
}
