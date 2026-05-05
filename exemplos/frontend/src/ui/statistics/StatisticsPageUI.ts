import { StatisticPageUI } from "./StatisticUI.js";
import { clearContainer, addElementInContainer } from "../dom/index.js";

// ============================================
// EXEMPLO 1: Inicialização básica
// ============================================
export async function initializeStatisticsPage(): Promise<void> {
  // Certifique-se de que o HTML contém um elemento com id="statistics-container"
  const ui = new StatisticPageUI("statistics-container");

  // Renderizar todos os gráficos
  await ui.render();
}

// ============================================
// EXEMPLO 2: Atualizar gráficos em tempo real
// ============================================
export function setupAutoUpdate(
  ui: StatisticPageUI,
  intervalMs: number = 5000,
): void {
  setInterval(() => {
    void ui.updateAllCharts();
  }, intervalMs);
}

// ============================================
// EXEMPLO 6: Integração com eventos
// ============================================
export function setupEventListeners(ui: StatisticPageUI): void {
  // Atualizar gráficos quando uma tarefa é criada/atualizada
  document.addEventListener("taskCreated", () => {
    void ui.updateAllCharts();
  });

  document.addEventListener("taskCompleted", () => {
    void ui.updateAllCharts();
  });

  document.addEventListener("taskDeleted", () => {
    void ui.updateAllCharts();
  });
}

// ============================================
// EXEMPLO 7: Setup completo
// ============================================
export async function setupCompleteStatisticsPage(): Promise<void> {
  try {
    // Limpar o container principal
    clearContainer("#containerSection");

    // Criar container para as estatísticas
    const statisticsContainer = document.createElement("div");
    statisticsContainer.id = "statistics-container";

    // Adicionar ao documento
    addElementInContainer("#containerSection", statisticsContainer);

    // Importar CSS se ainda não estiver carregado
    if (!document.querySelector('link[href*="statistics.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "./src/styles/statistics.css";
      document.head.appendChild(link);
    }

    // Inicializar UI
    const ui = new StatisticPageUI("statistics-container");
    await ui.render();

    // Configurar auto-atualização (a cada 30 segundos)
    setupAutoUpdate(ui, 30000);

    // Configurar event listeners
    setupEventListeners(ui);
  } catch (error) {
    console.error("❌ Erro ao configurar dashboard:", error);
  }
}

// ============================================
// EXEMPLO 8: Tipos de gráficos disponíveis
// ============================================

export const CHART_TYPES = {
  BAR: "bar",
  PIE: "pie",
  LINE: "line",
  DOUGHNUT: "doughnut",
  AREA: "area",
} as const;
