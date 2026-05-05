import { IProject } from "../../projects/index.js";
import { ProjectService } from "../../services/index.js";
import { renderProjectModal } from "../modal/index.js";
import { showProjectsCounters } from "./ProjectsCountersUI.js";
import {
  addElementInContainer,
  createHeadingTitle,
  createSearchContainer,
  createStatisticsCounter,
  createSection,
  clearContainer,
} from "../dom/index.js";
import { renderProjectsCards } from "./index.js";

/* Lista de projetos */
export async function loadProjectsPage(projects: IProject[]): Promise<void> {
  clearContainer("#containerSection");

  addElementInContainer(
    "#containerSection",
    createHeadingTitle("h2", "GESTÃO DE PROJETOS"),
  );

  const projectCounterSection = createProjectCounter("projectCounters");
  addElementInContainer("#containerSection", projectCounterSection);

  const searchContainer = showSearchProjectContainer();
  addElementInContainer("#containerSection", searchContainer);

  // Aguardar render do DOM antes de atualizar contadores
  await new Promise((resolve) => setTimeout(resolve, 100));
  await showProjectsCounters("projetos");

  // renderizar projetos em cards
  renderProjectsCards(projects);

  // Adicionar event listeners aos botões de contador para filtrar
  const allProjectsBtn = projectCounterSection.querySelector(
    "#allProjectsBtn",
  ) as HTMLElement | null;
  const activeProjectsBtn = projectCounterSection.querySelector(
    "#activeProjectsBtn",
  ) as HTMLElement | null;
  const finishedProjectsBtn = projectCounterSection.querySelector(
    "#finishedProjectsBtn",
  ) as HTMLElement | null;
  const inDevelopmentProjectsBtn = projectCounterSection.querySelector(
    "#inDevelopmentProjectsBtn",
  ) as HTMLElement | null;

  if (allProjectsBtn) {
    allProjectsBtn.title = "Mostrar todos os projetos";
    allProjectsBtn.addEventListener("click", async () => {
      const currentProjects = await ProjectService.getProjects();
      renderProjectsCards(currentProjects);
      await showProjectsCounters("projetos");
    });
  }

  if (activeProjectsBtn) {
    activeProjectsBtn.addEventListener("click", async () => {
      const allProjects = await ProjectService.getProjects();
      const activeProjects = allProjects.filter(
        (p) => p.getStatus() === "Ativo",
      );
      renderProjectsCards(activeProjects);
      await showProjectsCounters("ativos", activeProjects);
    });
  }

  if (finishedProjectsBtn) {
    finishedProjectsBtn.addEventListener("click", async () => {
      const allProjects = await ProjectService.getProjects();
      const finishedProjects = allProjects.filter(
        (p) => p.getStatus() === "Concluido",
      );
      renderProjectsCards(finishedProjects);
      await showProjectsCounters("concluidos", finishedProjects);
    });
  }

  if (inDevelopmentProjectsBtn) {
    inDevelopmentProjectsBtn.addEventListener("click", async () => {
      const allProjects = await ProjectService.getProjects();
      const devProjects = allProjects.filter(
        (p) => p.getStatus() === "Em Desenvolvimento",
      );
      renderProjectsCards(devProjects);
      await showProjectsCounters("desenvolvimento", devProjects);
    });
  }

  // Event listener para busca - usar searchContainer.querySelector
  const searchProjectInput = searchContainer.querySelector(
    "#searchProject",
  ) as HTMLInputElement;
  if (searchProjectInput) {
    searchProjectInput.addEventListener("input", async () => {
      const searchTerm = searchProjectInput.value;
      const searchedProjects = await ProjectService.getProjects(
        undefined,
        searchTerm,
      );
      renderProjectsCards(searchedProjects);
      await showProjectsCounters("filtrados", searchedProjects);
    });
  }

  // Event listener para adicionar projeto - usar searchContainer.querySelector
  const addProjectBtn = searchContainer.querySelector("#addProjectBtn") as HTMLElement;
  if (addProjectBtn) {
    addProjectBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await renderProjectModal();
    });
  }

  // Event listener para ordenar projetos - usar searchContainer.querySelector
  const sortProjectsBtn = searchContainer.querySelector(
    "#sortProjectsBtn",
  ) as HTMLElement;
  if (sortProjectsBtn) {
    let isAscending = true;
    sortProjectsBtn.addEventListener("click", async () => {
      const sortValue = isAscending ? "asc" : "desc";
      const sortedProjects = await ProjectService.getProjects(sortValue);
      isAscending = !isAscending;
      renderProjectsCards(sortedProjects);
      await showProjectsCounters("projetos", sortedProjects);
      sortProjectsBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
    });
  }
}

/* Cria o container de busca */
function showSearchProjectContainer(): HTMLElement {
  const searchProjectContainer = createSearchContainer(
    "searchProjectContainer",
    { id: "searchProject", placeholder: "Procurar projeto..." },
    [
      { id: "addProjectBtn", text: "Novo projeto" },
      { id: "sortProjectsBtn", text: "Ordenar A-Z" },
    ],
  );
  searchProjectContainer.classList.add("search-add-container");
  return searchProjectContainer;
}

/* Cria o container de contadores de projetos */
function createProjectCounter(id: string): HTMLElement {
  const allProjectsBtn = createStatisticsCounter(
    "allProjectsSection",
    "allProjectsBtn",
    "./src/assets/projeto.png",
    "projetos",
    "allProjectsCounter",
  ) as HTMLElement;

  const activeProjectsBtn = createStatisticsCounter(
    "activeProjectsSection",
    "activeProjectsBtn",
    "./src/assets/projeto_ative.png",
    "ativos",
    "activeProjectsCounter",
  ) as HTMLElement;

  const inDevelopmentProjectsBtn = createStatisticsCounter(
    "inDevelopmentProjectsSection",
    "inDevelopmentProjectsBtn",
    "./src/assets/projeto_on_going.png",
    "desenvolvimento",
    "inDevelopmentProjectsCounter",
  ) as HTMLElement;

  const finishedProjectsBtn = createStatisticsCounter(
    "finishedProjectsSection",
    "finishedProjectsBtn",
    "./src/assets/projeto_finished.png",
    "concluídos",
    "finishedProjectsCounter",
  ) as HTMLElement;

  const filterProjectsBtn = createStatisticsCounter(
    "filterProjectsSection",
    "filterProjectsBtn",
    "./src/assets/filter.png",
    "filtrados",
    "filterProjectsCounter",
  ) as HTMLElement;

  const activeProjectsPercentageBtn = createStatisticsCounter(
    "activeProjectsPercentage",
    "activeProjectsPercentageBtn",
    "./src/assets/projeto_graph.png",
    "ativos %",
    "activeProjectsPercentageCounter",
    "projectsPercentageCaption",
  ) as HTMLElement;

  const sectionProjectsCounter = createSection(`${id}`) as HTMLElement;
  sectionProjectsCounter.classList.add("projects-counters");
  sectionProjectsCounter.append(
    allProjectsBtn,
    activeProjectsBtn,
    inDevelopmentProjectsBtn,
    finishedProjectsBtn,
    filterProjectsBtn,
    activeProjectsPercentageBtn,
  );
  return sectionProjectsCounter;
}
