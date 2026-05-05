var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserService } from "../../services/index.js";
import { addElementInContainer, createSection, createHeadingTitle, createStatisticsCounter, createSearchContainer, clearContainer, } from "../dom/index.js";
import { renderUsers, showUsersCounters } from "./index.js";
import { renderUserModal } from "../modal/index.js";
import { sortUsersByName, searchUserByName, getActiveUsers, getInactiveUsers, } from "../gestUserTask/index.js";
/* Lista de utilizadores */
export function loadUsersPage(users) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "GESTÃO DE UTILIZADORES"));
        const userCounterSection = createUserCounter("userCounters");
        addElementInContainer("#containerSection", userCounterSection);
        yield showUsersCounters("utilizadores");
        const searchContainer = showSearchContainer();
        addElementInContainer("#containerSection", searchContainer);
        const usersContainer = yield renderUsers(users);
        addElementInContainer("#containerSection", usersContainer);
        // Adicionar event listeners aos botões de contador para filtrar
        const allUsersBtn = userCounterSection.querySelector("#allUsersBtn");
        allUsersBtn.title = "Mostrar todos os utilizadores";
        const ativeUsersBtn = userCounterSection.querySelector("#ativeUsersBtn");
        ativeUsersBtn.title = "Mostrar todosos utilizadores ativos";
        const unableUsersBtn = userCounterSection.querySelector("#unableUsersBtn");
        unableUsersBtn.title = "Mostrar todos os utilizadores inativos";
        const filterUsersBtn = userCounterSection.querySelector("#filterUsersBtn");
        filterUsersBtn.title = "Mostrar todos os utilizadores filtrados pelo nome";
        allUsersBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const currentUsers = yield UserService.getUsers();
            clearContainer("#usersContainer");
            yield renderUsers(currentUsers);
            yield showUsersCounters("utilizadores");
        }));
        ativeUsersBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const activeUsers = yield getActiveUsers();
            clearContainer("#usersContainer");
            yield renderUsers(activeUsers);
            yield showUsersCounters("ativos", activeUsers);
        }));
        unableUsersBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const inactiveUsers = yield getInactiveUsers();
            clearContainer("#usersContainer");
            yield renderUsers(inactiveUsers);
            yield showUsersCounters("inativos", inactiveUsers);
        }));
        // Aguardar um pouco para garantir que o DOM foi renderizado
        yield new Promise((resolve) => setTimeout(resolve, 100));
        // Adicionar event listeners aos botões de busca
        const addUserBtn = document.querySelector("#addUserBtn");
        if (addUserBtn) {
            addUserBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                yield renderUserModal();
            }));
        }
        const sortUsersBtn = document.querySelector("#sortUsersBtn");
        if (sortUsersBtn) {
            let isAscending = true;
            sortUsersBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const sortedUsers = yield sortUsersByName(isAscending);
                isAscending = !isAscending;
                clearContainer("#usersContainer");
                yield renderUsers(sortedUsers);
                yield showUsersCounters("filtrados", sortedUsers);
                sortUsersBtn.textContent = isAscending ? "Ordenar Z-A" : "Ordenar A-Z";
            }));
        }
        else {
            console.warn("Elemento #sortUsersBtn não foi renderizado no DOM.");
        }
        const searchUser = document.querySelector("#searchUser");
        if (searchUser) {
            searchUser.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const name = searchUser.value.toLowerCase();
                if (name.trim() === "") {
                    const allUsers = yield UserService.getUsers();
                    clearContainer("#usersContainer");
                    yield renderUsers(allUsers);
                    yield showUsersCounters("utilizadores");
                }
                else {
                    const filteredUsers = yield searchUserByName(name);
                    clearContainer("#usersContainer");
                    yield renderUsers(filteredUsers);
                    yield showUsersCounters("filtrados", filteredUsers);
                }
            }));
        }
        else {
            console.warn("Elemento de busca de utilizadores não encontrado.");
        }
    });
}
/* */
function createUserCounter(id) {
    //
    const allUsersBtn = createStatisticsCounter("allUserSection", "allUsersBtn", "./src/assets/users.png", "utilizadores", "allUsersCounter");
    //
    const ativeUsersBtn = createStatisticsCounter("ativeUsers", "ativeUsersBtn", "./src/assets/active.png", "ativos", "ativeUsersCounter");
    //
    const unableUsersBtn = createStatisticsCounter("unableUsers", "unableUsersBtn", "./src/assets/inactive.png", "inativos", "unableUsersCounter");
    const filterUsersBtn = createStatisticsCounter("filterUsersSection", "filterUsersBtn", "./src/assets/filter.png", "fltrados", "filterUsersCounter");
    const ativeUsersPercentageBtn = createStatisticsCounter("ativeUserPercentage", "ativeUsersPercentageBtn", "./src/assets/percentagem.png", "ativos %", "ativeUsersPercentageCounter");
    const sectionUsersCounter = createSection(`${id}`);
    sectionUsersCounter.classList.add("users-counters");
    sectionUsersCounter.append(allUsersBtn, ativeUsersBtn, unableUsersBtn, filterUsersBtn, ativeUsersPercentageBtn);
    return sectionUsersCounter;
}
/* */
export function showSearchContainer() {
    const searchUserContainer = createSearchContainer("searchUserContainer", { id: "searchUser", placeholder: "Procurar utilizador..." }, [
        { id: "addUserBtn", text: "Adicionar utilizador" },
        { id: "sortUsersBtn", text: "Ordenar A-Z" },
    ]);
    searchUserContainer.classList.add("search-add-container");
    return searchUserContainer;
}
