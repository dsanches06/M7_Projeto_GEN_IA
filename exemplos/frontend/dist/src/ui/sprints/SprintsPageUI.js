var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SprintService } from "../../services/index.js";
import { showSprintsCounters } from "./index.js";
import { addElementInContainer, createHeadingTitle, createSearchContainer, createStatisticsCounter, createSection, clearContainer, } from "../dom/index.js";
import { renderSprintsCards } from "./index.js";
/* Lista de sprints */
export function loadSprintsPage(sprints) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "GESTÃO DE SPRINTS"));
        const sprintCounterSection = createSprintCounter("sprintCounters");
        addElementInContainer("#containerSection", sprintCounterSection);
        const searchContainer = showSearchSprintContainer();
        addElementInContainer("#containerSection", searchContainer);
        // Aguardar render do DOM antes de atualizar contadores
        yield new Promise((resolve) => setTimeout(resolve, 0));
        yield showSprintsCounters("sprints");
        // renderizar sprints em cards
        const sprintsContainer = yield renderSprintsCards(sprints);
        addElementInContainer("#containerSection", sprintsContainer);
        // Adicionar event listeners aos botões de contador para filtrar
        const allSprintsBtn = sprintCounterSection.querySelector("#allSprintsBtn");
        if (allSprintsBtn) {
            allSprintsBtn.title = "Mostrar todos os sprints";
            allSprintsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const currentSprints = yield SprintService.getSprints();
                clearContainer("#sprintsGridContainer");
                const sprintsContainer = yield renderSprintsCards(currentSprints);
                const oldContainer = document.querySelector("#sprintsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(sprintsContainer);
                }
                else {
                    addElementInContainer("#containerSection", sprintsContainer);
                }
                yield showSprintsCounters("sprints");
            }));
        }
        // Event listener para busca
        const searchSprintInput = document.querySelector("#searchSprint");
        if (searchSprintInput) {
            searchSprintInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const searchTerm = searchSprintInput.value;
                const searchedSprints = yield SprintService.getSprints(undefined, searchTerm);
                clearContainer("#sprintsGridContainer");
                const sprintsContainer = yield renderSprintsCards(searchedSprints);
                const oldContainer = document.querySelector("#sprintsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(sprintsContainer);
                }
                else {
                    addElementInContainer("#containerSection", sprintsContainer);
                }
                yield showSprintsCounters("filtrados", searchedSprints);
            }));
        }
        // Event listener para ordenar sprints
        const sortSprintsBtn = document.querySelector("#sortSprintsBtn");
        if (sortSprintsBtn) {
            let isAscending = true;
            sortSprintsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allSprints = yield SprintService.getSprints();
                const sortedSprints = allSprints.sort((a, b) => {
                    const aName = a.name || "";
                    const bName = b.name || "";
                    return isAscending
                        ? aName.localeCompare(bName)
                        : bName.localeCompare(aName);
                });
                isAscending = !isAscending;
                clearContainer("#sprintsGridContainer");
                const sprintsContainer = yield renderSprintsCards(sortedSprints);
                const oldContainer = document.querySelector("#sprintsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(sprintsContainer);
                }
                else {
                    addElementInContainer("#containerSection", sprintsContainer);
                }
                yield showSprintsCounters("sprints", sortedSprints);
                sortSprintsBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
            }));
        }
    });
}
/* Cria o container de busca */
function showSearchSprintContainer() {
    const searchSprintContainer = createSearchContainer("searchSprintContainer", { id: "searchSprint", placeholder: "Procurar sprint..." }, [
        { id: "sortSprintsBtn", text: "Ordenar A-Z" },
    ]);
    searchSprintContainer.classList.add("search-add-container");
    return searchSprintContainer;
}
/* Cria o container de contadores de sprints */
function createSprintCounter(id) {
    const allSprintsBtn = createStatisticsCounter("allSprintsSection", "allSprintsBtn", "./src/assets/sprint.png", "sprints", "allSprintsCounter");
    const filterSprintsBtn = createStatisticsCounter("filterSprintsSection", "filterSprintsBtn", "./src/assets/filter.png", "filtrados", "filterSprintsCounter");
    const sectionSprintsCounter = createSection(`${id}`);
    sectionSprintsCounter.classList.add("sprints-counters");
    sectionSprintsCounter.append(allSprintsBtn, filterSprintsBtn);
    return sectionSprintsCounter;
}
