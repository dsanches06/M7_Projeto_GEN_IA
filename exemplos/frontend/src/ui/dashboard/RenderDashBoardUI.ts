import { UsersDashboard } from "../users/index.js";
import { ITask } from "../../tasks/index.js";
import { IUser } from "../../models/index.js";
import { addElementInContainer } from "../dom/index.js";

export async function renderDashboard(
  tasks: ITask[],
  user: IUser,
): Promise<void> {
  // 1. Cria a instância da classe
  const dashboard = new UsersDashboard(user, tasks);

  // 2. Gera o HTML do dashboard
  const renderedElement = dashboard.render();

  // 3. Adiciona ao ecrã (verifica se já não existe para não duplicar)
  const existing = document.querySelector("#dashBoardContainer");
  if (!existing) {
    // Usa a tua função auxiliar para inserir no DOM
    addElementInContainer("#containerSection", renderedElement);
  }

  // 4. Inicializa o dashboard (popula as colunas com cards)
  await dashboard.initializeDashboard();
}
