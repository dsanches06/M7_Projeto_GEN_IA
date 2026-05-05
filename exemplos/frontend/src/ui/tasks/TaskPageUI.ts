import { TaskService } from "../../services/index.js";
import { ProjectService } from "../../services/index.js";
import { showTasksCounters } from "./index.js";
import { TaskDashboardUI } from "./index.js";
import { renderTaskModal } from "../modal/index.js";
import {
  addElementInContainer,
  createSection,
  createHeadingTitle,
  createStatisticsCounter,
  createSearchContainer,
  clearContainer,
} from "../dom/index.js";
import { showConfirmDialog, showInfoBanner } from "../../helpers/index.js";

/* Lista de tarefas obtidas da API */
export async function loadTasksPage(): Promise<void> {
  clearContainer("#containerSection");

  addElementInContainer(
    "#containerSection",
    createHeadingTitle("h2", "VISÃO GERAL DE TAREFAS"),
  );

  const taskCounterSection = createTaskCounter("taskCounters") as HTMLElement;
  addElementInContainer("#containerSection", taskCounterSection);

  const searchContainer = showSearchTaskContainer();
  addElementInContainer("#containerSection", searchContainer);

  // Carregar tarefas da API
  const tasks = await TaskService.getTasks();

  // Renderizar dashboard com as tarefas
  const taskDashboard = new TaskDashboardUI();
  addElementInContainer("#containerSection", await taskDashboard.loadAndRender());

  // Aguardar render do DOM antes de atualizar contadores
  await new Promise((resolve) => setTimeout(resolve, 0));
  await showTasksCounters("tarefas", tasks);

  // Event listener para busca de tarefas
  const searchTaskInput = document.querySelector(
    "#searchTask",
  ) as HTMLInputElement;
  if (searchTaskInput) {
    searchTaskInput.addEventListener("input", async () => {
      const searchTerm = searchTaskInput.value;
      const searchedTasks = await TaskService.getTasks(undefined, searchTerm);
      await showTasksCounters("filtradas", searchedTasks);
    });
  }

  // Event listener para ordenar tarefas
  const sortTasksBtn = document.querySelector("#sortTasksBtn") as HTMLElement;
  if (sortTasksBtn) {
    let isAscending = true;
    sortTasksBtn.addEventListener("click", async () => {
      const allTasks = await TaskService.getTasks();
      const sortedTasks = allTasks.sort((a, b) => {
        const aTitle = a.getTitle?.() || "";
        const bTitle = b.getTitle?.() || "";
        return isAscending
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle);
      });
      isAscending = !isAscending;
      sortTasksBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
      await showTasksCounters("filtradas", sortedTasks);
    });
  }

  // Aguardar um pouco para garantir que o DOM foi renderizado
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Event listener para remover todas as tarefas concluídas
  const removeAllCompletedTaskBtn = document.querySelector(
    "#removeAllCompletedTaskBtn",
  ) as HTMLElement;
  if (removeAllCompletedTaskBtn) {
    removeAllCompletedTaskBtn.addEventListener("click", async () => {
      const confirmed = await showConfirmDialog(
        "Tem certeza que deseja remover todas as tarefas concluídas?",
      );
      if (confirmed) {
        try {
          const allTasks = await TaskService.getTasks();
          const completedTasks = allTasks.filter((task) => {
            const status = task.getStatus?.();
            return status?.toString().toLowerCase() === "concluído";
          });

          for (const task of completedTasks) {
            await TaskService.deleteTask(task.getId());
          }

          showInfoBanner(
            `${completedTasks.length} tarefa(s) removida(s).`,
            "success-banner",
          );
          await loadTasksPage();
        } catch (error) {
          showInfoBanner("Erro ao remover tarefas concluídas.", "error-banner");
          console.error(error);
        }
      }
    });
  }
}

function createTaskCounter(id: string): HTMLElement {
  const allTasksBtn = createStatisticsCounter(
    "allTaskSection",
    "allTasksBtn",
    "./src/assets/tarefa.png",
    "tarefas",
    "allTasksCounter",
  ) as HTMLElement;

  const pendingTaskBtn = createStatisticsCounter(
    "pendingTaskSection",
    "pendingTaskBtn",
    "./src/assets/pendente.png",
    "pendentes",
    "pendingTasksCounter",
  ) as HTMLElement;

  const completedTaskBtn = createStatisticsCounter(
    "completedTaskSection",
    "completedTaskBtn",
    "./src/assets/tarefa-concluida.png",
    "concluídos",
    "completedTaskCounter",
  ) as HTMLElement;

  const sectionTasksCounter = createSection(`${id}`) as HTMLElement;
  sectionTasksCounter.classList.add("tasks-counters");
  sectionTasksCounter.append(allTasksBtn, pendingTaskBtn, completedTaskBtn);

  return sectionTasksCounter;
}

function showSearchTaskContainer(): HTMLElement {
  const searchTaskContainer = createSearchContainer(
    "searchTaskContainer",
    { id: "searchTask", placeholder: "Procurar tarefa..." },
    [
      { id: "sortTasksBtn", text: "Ordenar A-Z" },
      { id: "removeAllCompletedTaskBtn", text: "Limpar Concluídas" },
    ],
  );
  searchTaskContainer.classList.add("search-add-container");
  return searchTaskContainer;
}
