import { ITask } from "../../tasks/index.js";
import {
  TaskAssigneeService,
  TaskService,
  UserService,
  ProjectService,
} from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { showTasksCounters } from "../tasks/index.js";
import { renderTaskModal } from "../modal/index.js";
import {
  removeAllCompletedTask,
  sortTasksByTitle,
} from "../gestUserTask/index.js";
import {
  addElementInContainer,
  createSection,
  createHeadingTitle,
  createStatisticsCounter,
  createSearchContainer,
  clearContainer,
} from "../dom/index.js";
import { createNotificationsUI } from "../notifications/index.js";
import { renderDashboard } from "../dashboard/index.js";
import {
  styleTransparentButton,
  styleSearchInput,
} from "../dom/buttonStyles.js";

/* Lista de tarefas de utilizador obtidas da API */
export async function loadUserTasksPage(userId: number): Promise<void> {
  clearContainer("#containerSection");

  try {
    const user = await UserService.getUserById(userId);

    if (!user) {
      showInfoBanner("Utilizador não encontrado", "error-banner");
      return;
    }

    // Adicionar título
    addElementInContainer(
      "#containerSection",
      createHeadingTitle("h2", `TAREFAS DE ${user.getName().toUpperCase()}`),
    );

    // Obter atribuições de tarefas do utilizador
    const assigneesTasks =
      await TaskAssigneeService.getTaskAssigneesByUserId(userId);

    // Obter detalhes das tarefas atribuídas
    const tasks: ITask[] = [];
    for (const assignee of assigneesTasks) {
      try {
        const task: ITask = await TaskService.getTaskById(assignee.task_id);
        tasks.push(task);
      } catch (error) {
        console.warn(
          `Tarefa com ID ${assignee.task_id} não encontrada, pulando...`,
        );
      }
    }

    // Adicionar notificações
    addElementInContainer(
      "#containerSection",
      await createNotificationsUI(user),
    );

    if (tasks.length === 0) {
      showInfoBanner("Este utilizador não tem tarefas atribuídas", "info-banner");
      return;
    }

    // Criar e adicionar contadores de tarefas
    const taskCounterSection = createTaskCounter("taskCounters") as HTMLElement;
    addElementInContainer("#containerSection", taskCounterSection);
    
    // Atualizar contadores
    await showTasksCounters("tarefas", tasks);

    // Criar e adicionar container de busca
    const searchContainer = showSearchContainer();
    addElementInContainer("#containerSection", searchContainer);

    // Renderizar dashboard com as tarefas
    await renderDashboard(tasks, user);

    // Adicionar event listeners aos botões de contador para filtrar
    setupCounterButtons(taskCounterSection, tasks);
    await setupActionButtons(tasks, user);

  } catch (error) {
    console.error("Erro ao carregar tarefas do utilizador:", error);
    showInfoBanner(
      "Erro ao carregar tarefas do utilizador. Por favor, tente novamente.",
      "error-banner",
    );
  }
}

/* Configurar event listeners dos botões de contador */
function setupCounterButtons(taskCounterSection: HTMLElement, tasks: ITask[]): void {
  const allTasksBtn = taskCounterSection.querySelector(
    "#allTasksBtn",
  ) as HTMLElement;
  allTasksBtn.title = "Mostrar todas as tarefas";

  const pendingTaskBtn = taskCounterSection.querySelector(
    "#pendingTaskBtn",
  ) as HTMLElement;
  pendingTaskBtn.title = "Mostrar tarefas pendentes";

  const completedTaskBtn = taskCounterSection.querySelector(
    "#completedTaskBtn",
  ) as HTMLElement;
  completedTaskBtn.title = "Mostrar tarefas concluídas";

  allTasksBtn.addEventListener("click", async () => {
    clearContainer("#tasksContainer");
    await showTasksCounters("tarefas", tasks);
  });

  pendingTaskBtn.addEventListener("click", async () => {
    const tasksPending = tasks.filter((task) => !task.getCompleted());
    clearContainer("#tasksContainer");
    await showTasksCounters("pendentes", tasksPending);
  });

  completedTaskBtn.addEventListener("click", async () => {
    const tasksCompleted = tasks.filter((task) => task.getCompleted());
    clearContainer("#tasksContainer");
    await showTasksCounters("concluídas", tasksCompleted);
  });
}

/* Configurar event listeners dos botões de ação */
async function setupActionButtons(tasks: ITask[], user: any): Promise<void> {
  const addTasksBtn = document.querySelector("#addTasksBtn") as HTMLElement;
  if (addTasksBtn) {
    addTasksBtn.addEventListener("click", async () => {
      try {
        // Procurar um projeto padrão ou usar o primeiro disponível
        const projects = await ProjectService.getProjects();
        const projectId = projects.length > 0 ? projects[0].getId() : 1;
        
        await renderTaskModal(projectId, undefined, user, async () => {
          // Callback após sucesso - recarregar tarefas
          await loadUserTasksPage(user.getId());
        });
      } catch (error) {
        console.error("Erro ao abrir modal de tarefa:", error);
        showInfoBanner("Erro ao abrir formulário de tarefa", "error-banner");
      }
    });
  } else {
    console.warn("Elemento #addTasksBtn não foi renderizado no DOM.");
  }

  const sortTasksBtn = document.querySelector("#sortTasksBtn") as HTMLElement;
  if (sortTasksBtn) {
    let isAscending = true;
    sortTasksBtn.addEventListener("click", async () => {
      const sortedTasks = await sortTasksByTitle(isAscending);
      isAscending = !isAscending;
      clearContainer("#tasksContainer");
      await showTasksCounters("filtradas", sortedTasks);
      sortTasksBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
    });
  } else {
    console.warn("Elemento #sortTasksBtn não foi renderizado no DOM.");
  }

  // Adicionar event listeners ao input de busca
  const searchTaskInput = document.querySelector(
    "#searchTask",
  ) as HTMLInputElement;
  if (searchTaskInput) {
    searchTaskInput.addEventListener("input", async () => {
      const searchTerm = searchTaskInput.value.toLowerCase();
      if (searchTerm.trim() === "") {
        clearContainer("#tasksContainer");
        await showTasksCounters("tarefas", tasks);
      } else {
        const filteredSearchTasks = tasks.filter((task) =>
          task.getTitle().toLowerCase().includes(searchTerm),
        );
        clearContainer("#tasksContainer");
        await showTasksCounters("filtradas", filteredSearchTasks);
      }
    });
  } else {
    console.warn("Elemento de busca de tarefas não encontrado.");
  }

  // Adicionar event listener ao botão de remover tarefas concluídas
  const removeAllCompletedTaskBtn = document.querySelector(
    "#removeAllCompletedTaskBtn",
  ) as HTMLElement;
  if (removeAllCompletedTaskBtn) {
    removeAllCompletedTaskBtn.addEventListener("click", async () => {
      const remainingTasks = await removeAllCompletedTask();
      clearContainer("#tasksContainer");
      await showTasksCounters("tarefas", remainingTasks);
    });
  } else {
    console.warn(
      "Elemento #removeAllCompletedTaskBtn não foi renderizado no DOM.",
    );
  }
}
/* */
export function showSearchContainer(): HTMLElement {
  const searchTaskContainer = createSearchContainer(
    "searchTaskContainer",
    { id: "searchTask", placeholder: "Procurar tarefa..." },
    [
      { id: "addTasksBtn", text: "Adicionar Tarefa" },
      { id: "sortTasksBtn", text: "Ordenar A-Z" },
    ],
  );
  searchTaskContainer.classList.add("search-add-container");
  
  // Adicionar botão de remover concluídas
  const removeAllCompletedTaskBtn = document.createElement("button");
  removeAllCompletedTaskBtn.id = "removeAllCompletedTaskBtn";
  removeAllCompletedTaskBtn.className = "btn danger";
  removeAllCompletedTaskBtn.innerHTML = `<i class="fas fa-trash"></i> Limpar Concluídas`;
  removeAllCompletedTaskBtn.title = "Remover todas as tarefas concluídas";
  styleTransparentButton(removeAllCompletedTaskBtn, "#dc3545", "white");
  
  searchTaskContainer.appendChild(removeAllCompletedTaskBtn);
  return searchTaskContainer;
}

/* */
function createTaskCounter(id: string): HTMLElement {
  //
  const allTasksBtn = createStatisticsCounter(
    "allTaskSection",
    "allTasksBtn",
    "./src/assets/tarefa.png",
    "tarefas",
    "allTasksCounter",
  ) as HTMLElement;

  //
  const pendingTaskBtn = createStatisticsCounter(
    "pendingTaskSection",
    "pendingTaskBtn",
    "./src/assets/pendente.png",
    "pendentes",
    "pendingTasksCounter",
  ) as HTMLElement;
  //
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
