import {
  ProjectService,
  TaskService,
  SprintService,
} from "../../services/index.js";
import { renderSprintModal, renderTaskModal } from "../modal/index.js";
import { createHeadingTitle, activateMenu } from "../dom/index.js";
import { renderSprintsCards } from "../sprints/index.js";
import { renderTaskCards } from "../tasks/index.js";
import { loadProjectsPage } from "./index.js";
import { showInfoBanner } from "../../helpers/index.js";

// =======================
// INIT
// =======================
export async function renderProjectDashboard(id: number): Promise<HTMLElement> {
  const root = document.createElement("div") as HTMLDivElement;
  root.id = "dashboardProject";
  root.innerHTML = "";

  const project = await ProjectService.getProjectById(id);
  const projectName = project?.getName() || "Projeto";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
  backBtn.addEventListener("click", async () => {
    const projects = await ProjectService.getProjects();
    activateMenu("#menuProjects");
    await loadProjectsPage(projects);
  });
  root.appendChild(backBtn);

  // Criar container principal com abas/seções
  const container = document.createElement("div");
  container.className = "dashboard-container";

  // Cabeçalho do dashboard
  const heading = createHeadingTitle("h2", `DASHBOARD DO PROJETO: ${projectName}`);
  container.appendChild(heading);

  // Conteúdo principal em coluna: sprints em cima, tarefas embaixo
  const dashboardContent = document.createElement("div");
  dashboardContent.className = "project-dashboard-content";
  dashboardContent.style.display = "flex";
  dashboardContent.style.flexDirection = "column";
  dashboardContent.appendChild(await createSprintsSection(id));
  dashboardContent.appendChild(await createTasksSection(id));
  container.appendChild(dashboardContent);

  root.appendChild(container);
  return root;
}

// =======================
// SPRINTS SECTION
// =======================
async function createSprintsSection(projectId: number): Promise<HTMLElement> {
  const section = document.createElement("div");
  section.className = "project-dashboard-section sprints-section";

  try {
    // Carregar sprints do projeto
    const allSprints = await SprintService.getSprints();
    const projectSprints = allSprints.filter(
      (s: any) => s.project_id === projectId,
    );

    // Criar header com título e botão
    const header = document.createElement("div");
    header.className = "project-section-header";

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "section-title-wrapper";

    const title = document.createElement("h3");
    title.textContent = `Sprints (${projectSprints.length})`;
    titleWrapper.appendChild(title);

    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "+ Novo Sprint";
    addBtn.addEventListener("mouseover", () => {
      addBtn.style.opacity = "0.9";
    });
    addBtn.addEventListener("mouseout", () => {
      addBtn.style.opacity = "1";
    });
    addBtn.addEventListener("click", async () => {
      await renderSprintModal(projectId);
    });

    header.appendChild(titleWrapper);
    header.appendChild(addBtn);

    section.appendChild(header);

    const cardsContainer = document.createElement("div");
    cardsContainer.id = "projectSprintsContainer";
    cardsContainer.className = "project-section-cards";

    section.appendChild(cardsContainer);

    // Renderizar sprints em cards/lista
    if (projectSprints.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "empty-message";
      emptyMsg.textContent =
        "Nenhum sprint criado ainda. Clique em '+ Novo Sprint' para começar.";
      section.appendChild(emptyMsg);
    } else {
      const sprintsContainer = await renderSprintsCards(projectSprints);
      cardsContainer.appendChild(sprintsContainer);
    }
  } catch (error) {
    console.error("Erro ao carregar sprints:", error);
    showInfoBanner("Erro ao carregar sprints do projeto", "error-banner");
    const errorMsg = document.createElement("p");
    errorMsg.className = "error-message";
    errorMsg.textContent = "Erro ao carregar sprints do projeto";
    section.appendChild(errorMsg);
  }

  return section;
}

// =======================
// TASKS SECTION
// =======================
async function createTasksSection(projectId: number): Promise<HTMLElement> {
  const section = document.createElement("div");
  section.className = "project-dashboard-section tasks-section";

  try {
    const tasks = await TaskService.getTasksByProject(projectId);

    const header = document.createElement("div");
    header.className = "project-section-header";

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "section-title-wrapper";

    const title = document.createElement("h3");
    title.textContent = `Tarefas (${tasks.length})`;
    titleWrapper.appendChild(title);

    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "+ Nova Tarefa";
    addBtn.addEventListener("mouseover", () => {
      addBtn.style.opacity = "0.9";
    });
    addBtn.addEventListener("mouseout", () => {
      addBtn.style.opacity = "1";
    });
    addBtn.addEventListener("click", async () => {
      await renderTaskModal(projectId, undefined, undefined, async () => {
        const dashboardElement = document.querySelector("#dashboardProject");
        if (dashboardElement) {
          const projectDashboard = await renderProjectDashboard(projectId);
          dashboardElement.replaceWith(projectDashboard);
        }
      });
    });

    header.appendChild(titleWrapper);
    header.appendChild(addBtn);
    section.appendChild(header);

    const tasksContent = document.createElement("div");
    tasksContent.className = "project-section-cards";

    if (tasks.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "empty-message";
      emptyMsg.textContent =
        "Nenhuma tarefa criada ainda. Clique em '+ Nova Tarefa' para começar.";
      tasksContent.appendChild(emptyMsg);
    } else {
      const tasksList = document.createElement("div");
      tasksList.className = "project-tasks-grid";

      const renderedTasksContainer = await renderTaskCards(tasks);
      tasksList.appendChild(renderedTasksContainer);
      tasksContent.appendChild(tasksList);
    }

    section.appendChild(tasksContent);
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    showInfoBanner("Erro ao carregar tarefas do projeto", "error-banner");
    const errorMsg = document.createElement("p");
    errorMsg.className = "error-message";
    errorMsg.textContent = "Erro ao carregar tarefas do projeto";
    section.appendChild(errorMsg);
  }

  return section;
}

// Exportar função para uso em outros módulos (evitar dependências circulares)
export { createSprintsSection };
