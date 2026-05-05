import { clearContainer } from "../dom/index.js";
import {
  setupCompleteStatisticsPage,
} from "../statistics/index.js";

/* Função principal para mostrar os projetos */
export async function loadInitialStatistics(): Promise<void> {
  // Limpa o container antes de mostrar os projetos
  clearContainer("#containerSection");
  // carrega a pagina dinamica de projetos
  await setupCompleteStatisticsPage();
}
