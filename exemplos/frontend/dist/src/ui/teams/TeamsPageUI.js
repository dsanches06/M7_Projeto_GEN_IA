var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TeamService } from "../../services/index.js";
import { renderTeamModal } from "../modal/index.js";
import { showTeamsCounters } from "./TeamsCountersUI.js";
import { addElementInContainer, createHeadingTitle, createSearchContainer, createStatisticsCounter, createSection, clearContainer, } from "../dom/index.js";
import { renderTeamsCards } from "./index.js";
/* Lista de equipes */
export function loadTeamsPage(teams) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "GESTÃO DE EQUIPES"));
        const teamCounterSection = createTeamCounter("teamCounters");
        addElementInContainer("#containerSection", teamCounterSection);
        const searchContainer = showSearchTeamContainer();
        addElementInContainer("#containerSection", searchContainer);
        // Aguardar render do DOM antes de atualizar contadores
        yield new Promise((resolve) => setTimeout(resolve, 0));
        yield showTeamsCounters("equipes");
        // renderizar equipes em cards
        if (teams) {
            const teamsContainer = yield renderTeamsCards(teams);
            addElementInContainer("#containerSection", teamsContainer);
        }
        else {
            const allTeams = yield TeamService.getTeams();
            const teamsContainer = yield renderTeamsCards(allTeams);
            addElementInContainer("#containerSection", teamsContainer);
        }
        // Adicionar event listeners aos botões de contador para filtrar
        const allTeamsBtn = teamCounterSection.querySelector("#allTeamsBtn");
        if (allTeamsBtn) {
            allTeamsBtn.title = "Mostrar todas as equipes";
            allTeamsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const currentTeams = yield TeamService.getTeams();
                clearContainer("#teamsGridContainer");
                const teamsContainer = yield renderTeamsCards(currentTeams);
                const oldContainer = document.querySelector("#teamsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(teamsContainer);
                }
                else {
                    addElementInContainer("#containerSection", teamsContainer);
                }
                yield showTeamsCounters("equipes");
            }));
        }
        // Event listener para busca
        const searchTeamInput = document.querySelector("#searchTeam");
        if (searchTeamInput) {
            searchTeamInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const searchTerm = searchTeamInput.value;
                const searchedTeams = yield TeamService.getTeams();
                const filteredTeams = searchedTeams.filter((t) => { var _a; return (((_a = t.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "").includes(searchTerm.toLowerCase()); });
                clearContainer("#teamsGridContainer");
                const teamsContainer = yield renderTeamsCards(filteredTeams);
                const oldContainer = document.querySelector("#teamsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(teamsContainer);
                }
                else {
                    addElementInContainer("#containerSection", teamsContainer);
                }
                yield showTeamsCounters("filtrados", filteredTeams);
            }));
        }
        // Event listener para adicionar equipe
        const addTeamBtn = document.querySelector("#addTeamBtn");
        if (addTeamBtn) {
            addTeamBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                yield renderTeamModal();
            }));
        }
        // Event listener para ordenar equipes
        const sortTeamsBtn = document.querySelector("#sortTeamsBtn");
        if (sortTeamsBtn) {
            let isAscending = true;
            sortTeamsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allTeams = yield TeamService.getTeams();
                const sortedTeams = allTeams.sort((a, b) => {
                    const aName = a.name || "";
                    const bName = b.name || "";
                    return isAscending
                        ? aName.localeCompare(bName)
                        : bName.localeCompare(aName);
                });
                isAscending = !isAscending;
                clearContainer("#teamsGridContainer");
                const teamsContainer = yield renderTeamsCards(sortedTeams);
                const oldContainer = document.querySelector("#teamsGridContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(teamsContainer);
                }
                else {
                    addElementInContainer("#containerSection", teamsContainer);
                }
                yield showTeamsCounters("equipes", sortedTeams);
                sortTeamsBtn.textContent = isAscending ? "Ordenar A-Z" : "Ordenar Z-A";
            }));
        }
    });
}
/* Cria o container de busca */
function showSearchTeamContainer() {
    const searchTeamContainer = createSearchContainer("searchTeamContainer", { id: "searchTeam", placeholder: "Procurar equipe..." }, [
        { id: "addTeamBtn", text: "Nova equipe" },
        { id: "sortTeamsBtn", text: "Ordenar A-Z" },
    ]);
    searchTeamContainer.classList.add("search-add-container");
    return searchTeamContainer;
}
/* Cria o container de contadores de equipes */
function createTeamCounter(id) {
    const allTeamsBtn = createStatisticsCounter("allTeamsSection", "allTeamsBtn", "./src/assets/teams.png", "equipes", "allTeamsCounter");
    const filterTeamsBtn = createStatisticsCounter("filterTeamsSection", "filterTeamsBtn", "./src/assets/filter.png", "filtradas", "filterTeamsCounter");
    const sectionTeamsCounter = createSection(`${id}`);
    sectionTeamsCounter.classList.add("teams-counters");
    sectionTeamsCounter.append(allTeamsBtn, filterTeamsBtn);
    return sectionTeamsCounter;
}
