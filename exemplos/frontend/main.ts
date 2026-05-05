import {
  loadInitialUsers,
  loadAInitialTasks,
  loadInitialProjects,
  loadInitialStatistics,
  loadInitialTeams,
  loadInitialSprints,
  loadInitialTags,
} from "./src/ui/gestUserTask/index.js";
import { activateMenu, clearContainer } from "./src/ui/dom/index.js";

//inicializar a aplicação
window.onload = async () => {
  activateMenu("#menuProjects");
  await loadInitialProjects();
  // Configurar submenu de Projetos
  setupProjectsSubmenu();
};

// Configurar o submenu de Projetos
async function setupProjectsSubmenu(): Promise<void> {
  const projectsBtn = document.querySelector("#menuProjects") as HTMLElement;
  const submenu = document.querySelector("#projectsSubmenu") as HTMLElement;

  if (projectsBtn && submenu) {
    projectsBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      activateMenu("#menuProjects");
      await loadInitialProjects();
      submenu.classList.toggle("show");
      projectsBtn.classList.toggle("expanded");
    });
  }
}

//obter o menu task
const allMenuUsers = document.querySelector("#menuUsers") as HTMLAnchorElement;
allMenuUsers.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuUsers");
  await loadInitialUsers();
});

//obter o menu task
const allMenuTasks = document.querySelector("#menuTasks") as HTMLAnchorElement;
allMenuTasks.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuTasks");
  await loadAInitialTasks();
});

// menuTeams
const allMenuTeams = document.querySelector("#menuTeams") as HTMLAnchorElement;
allMenuTeams.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuTeams");
  await loadInitialTeams();
});

// menuSprints
const allMenuSprints = document.querySelector(
  "#menuSprints",
) as HTMLAnchorElement;
allMenuSprints.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuSprints");
  await loadInitialSprints();
});

// menuTags
const allMenuTags = document.querySelector("#menuTags") as HTMLAnchorElement;
allMenuTags.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuTags");
  await loadInitialTags();
});

// menuStatistics
const allMenuStatistics = document.querySelector(
  "#menuStatistics",
) as HTMLAnchorElement;
allMenuStatistics.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuStatistics");
  await loadInitialStatistics();
});

//voltar para a home
const homeButton = document.querySelector("#homeButton") as HTMLElement;
homeButton.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  activateMenu("#menuProjects");
  await loadInitialProjects();
});
