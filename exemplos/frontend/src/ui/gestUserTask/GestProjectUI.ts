import { ProjectService } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadProjectsPage } from "../projects/index.js";

/* Função principal para mostrar os projetos */
export async function loadInitialProjects(): Promise<void> {
  // Limpa o container antes de mostrar os projetos
  clearContainer("#containerSection");
  // carrega a pagina dinamica de projetos
  const projects = await ProjectService.getProjects();
  loadProjectsPage(projects);
}



