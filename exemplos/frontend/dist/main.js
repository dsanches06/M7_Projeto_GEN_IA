var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadInitialUsers, loadAInitialTasks, loadInitialProjects, loadInitialStatistics, loadInitialTeams, loadInitialSprints, loadInitialTags, } from "./src/ui/gestUserTask/index.js";
import { activateMenu } from "./src/ui/dom/index.js";
//inicializar a aplicação
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    activateMenu("#menuProjects");
    yield loadInitialProjects();
    // Configurar submenu de Projetos
    setupProjectsSubmenu();
});
// Configurar o submenu de Projetos
function setupProjectsSubmenu() {
    return __awaiter(this, void 0, void 0, function* () {
        const projectsBtn = document.querySelector("#menuProjects");
        const submenu = document.querySelector("#projectsSubmenu");
        if (projectsBtn && submenu) {
            projectsBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                e.stopPropagation();
                activateMenu("#menuProjects");
                yield loadInitialProjects();
                submenu.classList.toggle("show");
                projectsBtn.classList.toggle("expanded");
            }));
        }
    });
}
//obter o menu task
const allMenuUsers = document.querySelector("#menuUsers");
allMenuUsers.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuUsers");
    yield loadInitialUsers();
}));
//obter o menu task
const allMenuTasks = document.querySelector("#menuTasks");
allMenuTasks.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuTasks");
    yield loadAInitialTasks();
}));
// menuTeams
const allMenuTeams = document.querySelector("#menuTeams");
allMenuTeams.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuTeams");
    yield loadInitialTeams();
}));
// menuSprints
const allMenuSprints = document.querySelector("#menuSprints");
allMenuSprints.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuSprints");
    yield loadInitialSprints();
}));
// menuTags
const allMenuTags = document.querySelector("#menuTags");
allMenuTags.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuTags");
    yield loadInitialTags();
}));
// menuStatistics
const allMenuStatistics = document.querySelector("#menuStatistics");
allMenuStatistics.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuStatistics");
    yield loadInitialStatistics();
}));
//voltar para a home
const homeButton = document.querySelector("#homeButton");
homeButton.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    e.stopPropagation();
    activateMenu("#menuProjects");
    yield loadInitialProjects();
}));
