import { SprintService } from "../../services/index.js";
import { showSprintsCounters } from "./index.js";
import {
  addElementInContainer,
  createHeadingTitle,
  createSearchContainer,
  createStatisticsCounter,
  createSection,
  clearContainer,
} from "../dom/index.js";
import { renderSprintsCards } from "./index.js";

/* Lista de sprints */
export async function loadSprintsPage(sprints: any[]): Promise<void> {
  clearContainer("#containerSection");

  addElementInContainer(
    "#containerSection",
    createHeadingTitle("h2", "GESTÃO DE SPRINTS"),
  );

  const sprintCounterSection = createSprintCounter("sprintCounters");
  addElementInContainer("#containerSection", sprintCounterSection);

  const searchContainer = showSearchSprintContainer();
  addElementInContainer("#containerSection", searchContainer);

  // Aguardar render do DOM antes de atualizar contadores
  await new Promise((resolve) => setTimeout(resolve, 0));
  await showSprintsCounters("sprints");

  // renderizar sprints em cards
  const sprintsContainer = await renderSprintsCards(sprints);
  addElementInContainer("#containerSection", sprintsContainer);

  // Adicionar event listeners aos botões de contador para filtrar
  const allSprintsBtn = sprintCounterSection.querySelector(
    "#allSprintsBtn",
  ) as HTMLElement | null;

  if (allSprintsBtn) {
    allSprintsBtn.title = "Mostrar todos os sprints";
    allSprintsBtn.addEventListener("click", async () => {
      const currentSprints = await SprintService.getSprints();
      clearContainer("#sprintsGridContainer");
      const sprintsContainer = await renderSprintsCards(currentSprints);
      const oldContainer = document.querySelector("#sprintsGridContainer");
      if (oldContainer) {
        oldContainer.replaceWith(sprintsContainer);
      } else {
        addElementInContainer("#containerSection", sprintsContainer);
      }
      await showSprintsCounters("sprints");
    });
  }

  // Event listener para busca
  const searchSprintInput = document.querySelector(
    "#searchSprint",
  ) as HTMLInputElement;
  if (searchSprintInput) {
    searchSprintInput.addEventListener("input", async () => {
      const searchTerm = searchSprintInput.value;
      const searchedSprints = await SprintService.getSprints(
        undefined,
        searchTerm,
      );
      clearContainer("#sprintsGridContainer");
      const sprintsContainer = await renderSprintsCards(searchedSprints);
      const oldContainer = document.querySelector("#sprintsGridContainer");
      if (oldContainer) {
        oldContainer.replaceWith(sprintsContainer);
      } else {
        addElementInContainer("#containerSection", sprintsContainer);
      }
      await showSprintsCounters("filtrados", searchedSprints);
    });
  }

  // Event listener para ordenar sprints
  const sortSprintsBtn = document.querySelector(
    "#sortSprintsBtn",
  ) as HTMLElement;
  if (sortSprintsBtn) {
    let isAscending = true;
    sortSprintsBtn.addEventListener("click", async () => {
      const allSprints = await SprintService.getSprints();
      const sortedSprints = allSprints.sort((a, b) => {
        const aName = a.name || "";
        const bName = b.name || "";
        return isAscending
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      });
      isAscending = !isAscending;
      clearContainer("#sprintsGridContainer");
      const sprintsContainer = await renderSprintsCards(sortedSprints);
      const oldContainer = document.querySelector("#sprintsGridContainer");
      if (oldContainer) {
        oldContainer.replaceWith(sprintsContainer);
      } else {
        addElementInContainer("#containerSection", sprintsContainer);
      }
      await showSprintsCounters("sprints", sortedSprints);
      sortSprintsBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
    });
  }
}

/* Cria o container de busca */
function showSearchSprintContainer(): HTMLElement {
  const searchSprintContainer = createSearchContainer(
    "searchSprintContainer",
    { id: "searchSprint", placeholder: "Procurar sprint..." },
    [
      { id: "sortSprintsBtn", text: "Ordenar A-Z" },
    ],
  );
  searchSprintContainer.classList.add("search-add-container");
  return searchSprintContainer;
}

/* Cria o container de contadores de sprints */
function createSprintCounter(id: string): HTMLElement {
  const allSprintsBtn = createStatisticsCounter(
    "allSprintsSection",
    "allSprintsBtn",
    "./src/assets/sprint.png",
    "sprints",
    "allSprintsCounter",
  ) as HTMLElement;

  const filterSprintsBtn = createStatisticsCounter(
    "filterSprintsSection",
    "filterSprintsBtn",
    "./src/assets/filter.png",
    "filtrados",
    "filterSprintsCounter",
  ) as HTMLElement;

  const sectionSprintsCounter = createSection(`${id}`) as HTMLElement;
  sectionSprintsCounter.classList.add("sprints-counters");
  sectionSprintsCounter.append(allSprintsBtn, filterSprintsBtn);
  return sectionSprintsCounter;
}
