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
export function showProjectsCounters(type, projects) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((type === "filtrados" || type === "ativos" || type === "concluidos") && projects) {
            yield countAllProjects("#allProjectsCounter", projects.length);
            yield countActiveProjects("#activeProjectsCounter");
            yield countFinishedProjects("#finishedProjectsCounter");
            yield countInDevelopmentProjects("#inDevelopmentProjectsCounter");
            countFilterProjects("#filterProjectsCounter", type, projects.length);
            yield countActivePercentage("#activeProjectsPercentageCounter", type);
        }
        else {
            yield countAllProjects("#allProjectsCounter");
            yield countActiveProjects("#activeProjectsCounter");
            yield countFinishedProjects("#finishedProjectsCounter");
            yield countInDevelopmentProjects("#inDevelopmentProjectsCounter");
            countFilterProjects("#filterProjectsCounter", type);
            yield countActivePercentage("#activeProjectsPercentageCounter", type);
        }
    });
}
/* Contador de projetos ativos */
function countActiveProjects(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield ProjectService.getProjectsStats());
        if (section) {
            section.textContent = `${stats.activeProjects}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de projetos concluídos */
function countFinishedProjects(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield ProjectService.getProjectsStats());
        if (section) {
            section.textContent = `${stats.finishedProjects}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de projetos em desenvolvimento */
function countInDevelopmentProjects(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield ProjectService.getProjectsStats());
        if (section) {
            section.textContent = `${stats.inDevelopmentProjects}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de projetos filtrados */
function countFilterProjects(id, type, count) {
    const section = document.querySelector(`${id}`);
    if (section) {
        if (count !== undefined) {
            section.textContent = `${count}`;
        }
        else if (type === "projectFiltered" && section.textContent !== "") {
            section.textContent = `${0}`;
        }
        else {
            section.textContent = "0";
        }
    }
    else {
        console.warn(`Elemento ${id} não foi encontrado no DOM.`);
    }
}
/* Contador de todos os projetos */
function countAllProjects(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield ProjectService.getProjectsStats());
        if (section) {
            section.textContent = `${stats.totalProjects}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Percentagem de projetos ativos */
function countActivePercentage(id, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        const stats = (yield ProjectService.getProjectsStats());
        if (section) {
            if (type === "concluidos") {
                section.textContent = `${stats.finishedPercentage}`;
            }
            else {
                section.textContent = `${stats.activePercentage}`;
            }
            changeImageAndFigCaption(type);
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
function changeImageAndFigCaption(type) {
    if (type) {
        const projectsPercentageCaption = document.querySelector("#projectsPercentageCaption");
        const activeProjectsPercentageBtn = document.querySelector("#activeProjectsPercentageBtn");
        if (projectsPercentageCaption && activeProjectsPercentageBtn) {
            switch (type) {
                case "concluidos":
                    activeProjectsPercentageBtn.title =
                        "Mostrar percentagem de projetos concluídos";
                    activeProjectsPercentageBtn.src = "./src/assets/grafico.png";
                    projectsPercentageCaption.textContent = "concluídos %";
                    break;
                case "projetos":
                case "ativos":
                    activeProjectsPercentageBtn.title =
                        "Mostrar percentagem de projetos ativos";
                    activeProjectsPercentageBtn.src = "./src/assets/percentagem.png";
                    projectsPercentageCaption.textContent = "ativos %";
                    break;
                default:
            }
        }
        else {
            console.warn(`Elemento projectsPercentageCaption não foi encontrado no DOM.`);
        }
    }
}
