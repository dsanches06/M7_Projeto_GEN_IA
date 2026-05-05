var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProjectService } from "../../services/index.js";
import { renderProjectModal } from "../modal/index.js";
import { showProjectsCounters } from "./ProjectsCountersUI.js";
import { addElementInContainer, createHeadingTitle, createSearchContainer, createStatisticsCounter, createSection, clearContainer, } from "../dom/index.js";
import { renderProjectsCards } from "./index.js";
/* Lista de projetos */
export function loadProjectsPage(projects) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "GESTÃO DE PROJETOS"));
        const projectCounterSection = createProjectCounter("projectCounters");
        addElementInContainer("#containerSection", projectCounterSection);
        const searchContainer = showSearchProjectContainer();
        addElementInContainer("#containerSection", searchContainer);
        // Aguardar render do DOM antes de atualizar contadores
        yield new Promise((resolve) => setTimeout(resolve, 100));
        yield showProjectsCounters("projetos");
        // renderizar projetos em cards
        renderProjectsCards(projects);
        // Adicionar event listeners aos botões de contador para filtrar
        const allProjectsBtn = projectCounterSection.querySelector("#allProjectsBtn");
        const activeProjectsBtn = projectCounterSection.querySelector("#activeProjectsBtn");
        const finishedProjectsBtn = projectCounterSection.querySelector("#finishedProjectsBtn");
        const inDevelopmentProjectsBtn = projectCounterSection.querySelector("#inDevelopmentProjectsBtn");
        if (allProjectsBtn) {
            allProjectsBtn.title = "Mostrar todos os projetos";
            allProjectsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const currentProjects = yield ProjectService.getProjects();
                renderProjectsCards(currentProjects);
                yield showProjectsCounters("projetos");
            }));
        }
        if (activeProjectsBtn) {
            activeProjectsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allProjects = yield ProjectService.getProjects();
                const activeProjects = allProjects.filter((p) => p.getStatus() === "Ativo");
                renderProjectsCards(activeProjects);
                yield showProjectsCounters("ativos", activeProjects);
            }));
        }
        if (finishedProjectsBtn) {
            finishedProjectsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allProjects = yield ProjectService.getProjects();
                const finishedProjects = allProjects.filter((p) => p.getStatus() === "Concluido");
                renderProjectsCards(finishedProjects);
                yield showProjectsCounters("concluidos", finishedProjects);
            }));
        }
        if (inDevelopmentProjectsBtn) {
            inDevelopmentProjectsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allProjects = yield ProjectService.getProjects();
                const devProjects = allProjects.filter((p) => p.getStatus() === "Em Desenvolvimento");
                renderProjectsCards(devProjects);
                yield showProjectsCounters("desenvolvimento", devProjects);
            }));
        }
        // Event listener para busca - usar searchContainer.querySelector
        const searchProjectInput = searchContainer.querySelector("#searchProject");
        if (searchProjectInput) {
            searchProjectInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const searchTerm = searchProjectInput.value;
                const searchedProjects = yield ProjectService.getProjects(undefined, searchTerm);
                renderProjectsCards(searchedProjects);
                yield showProjectsCounters("filtrados", searchedProjects);
            }));
        }
        // Event listener para adicionar projeto - usar searchContainer.querySelector
        const addProjectBtn = searchContainer.querySelector("#addProjectBtn");
        if (addProjectBtn) {
            addProjectBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.stopPropagation();
                yield renderProjectModal();
            }));
        }
        // Event listener para ordenar projetos - usar searchContainer.querySelector
        const sortProjectsBtn = searchContainer.querySelector("#sortProjectsBtn");
        if (sortProjectsBtn) {
            let isAscending = true;
            sortProjectsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const sortValue = isAscending ? "asc" : "desc";
                const sortedProjects = yield ProjectService.getProjects(sortValue);
                isAscending = !isAscending;
                renderProjectsCards(sortedProjects);
                yield showProjectsCounters("projetos", sortedProjects);
                sortProjectsBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
            }));
        }
    });
}
/* Cria o container de busca */
function showSearchProjectContainer() {
    const searchProjectContainer = createSearchContainer("searchProjectContainer", { id: "searchProject", placeholder: "Procurar projeto..." }, [
        { id: "addProjectBtn", text: "Novo projeto" },
        { id: "sortProjectsBtn", text: "Ordenar A-Z" },
    ]);
    searchProjectContainer.classList.add("search-add-container");
    return searchProjectContainer;
}
/* Cria o container de contadores de projetos */
function createProjectCounter(id) {
    const allProjectsBtn = createStatisticsCounter("allProjectsSection", "allProjectsBtn", "./src/assets/projeto.png", "projetos", "allProjectsCounter");
    const activeProjectsBtn = createStatisticsCounter("activeProjectsSection", "activeProjectsBtn", "./src/assets/projeto_ative.png", "ativos", "activeProjectsCounter");
    const inDevelopmentProjectsBtn = createStatisticsCounter("inDevelopmentProjectsSection", "inDevelopmentProjectsBtn", "./src/assets/projeto_on_going.png", "desenvolvimento", "inDevelopmentProjectsCounter");
    const finishedProjectsBtn = createStatisticsCounter("finishedProjectsSection", "finishedProjectsBtn", "./src/assets/projeto_finished.png", "concluídos", "finishedProjectsCounter");
    const filterProjectsBtn = createStatisticsCounter("filterProjectsSection", "filterProjectsBtn", "./src/assets/filter.png", "filtrados", "filterProjectsCounter");
    const activeProjectsPercentageBtn = createStatisticsCounter("activeProjectsPercentage", "activeProjectsPercentageBtn", "./src/assets/projeto_graph.png", "ativos %", "activeProjectsPercentageCounter", "projectsPercentageCaption");
    const sectionProjectsCounter = createSection(`${id}`);
    sectionProjectsCounter.classList.add("projects-counters");
    sectionProjectsCounter.append(allProjectsBtn, activeProjectsBtn, inDevelopmentProjectsBtn, finishedProjectsBtn, filterProjectsBtn, activeProjectsPercentageBtn);
    return sectionProjectsCounter;
}
