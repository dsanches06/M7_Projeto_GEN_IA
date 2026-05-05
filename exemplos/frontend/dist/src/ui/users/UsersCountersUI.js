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
export function showUsersCounters(type, users) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((type === "inativos" || type === "ativos" || type === "filtrados") &&
            users) {
            countAllUsers("#allUsersCounter", users.length);
            if (type === "ativos") {
                countAtiveUsers("#ativeUsersCounter", users.length);
                countUnableUsers("#unableUsersCounter", 0);
            }
            else if (type === "inativos") {
                countUnableUsers("#unableUsersCounter", users.length);
                countAtiveUsers("#ativeUsersCounter", 0);
            }
            else {
                countAtiveUsers("#ativeUsersCounter", users.length);
                countUnableUsers("#unableUsersCounter", users.length);
            }
            countFilterUsers("#filterUsersCounter", type, users.length);
            yield countAtiveInativePercentage("#ativeUsersPercentageCounter", type);
        }
        else {
            yield countAllUsers("#allUsersCounter");
            yield countAtiveUsers("#ativeUsersCounter");
            yield countUnableUsers("#unableUsersCounter");
            countFilterUsers("#filterUsersCounter", type);
            yield countAtiveInativePercentage("#ativeUsersPercentageCounter", type);
        }
    });
}
/* Contador de utilizadores ativos */
function countAtiveUsers(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield UserService.getUserStats());
        if (section) {
            section.textContent = `${stats.activeUsers}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de utilizadores inativos */
function countUnableUsers(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield UserService.getUserStats());
        if (section) {
            section.textContent = `${stats.inactiveUsers}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de utilizadores filtrados por nome */
function countFilterUsers(id, type, count) {
    const section = document.querySelector(`${id}`);
    if (section) {
        if (count !== undefined) {
            section.textContent = `${count}`;
        }
        else if (type === "userFiltered" && section.textContent !== "") {
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
/* Contador de utilizadores */
function countAllUsers(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield UserService.getUserStats());
        if (section) {
            section.textContent = `${stats.totalUsers}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Percentagem de utilizadores ativos */
function countAtiveInativePercentage(id, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        const stats = (yield UserService.getUserStats());
        if (section) {
            if (type === "inactivos") {
                section.textContent = `${stats.inactivePercentage}`;
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
        const ativosPercentangeCaption = document.querySelector("#ativosPercentangeCaption");
        const ativeUsersPercentageBtn = document.querySelector("#ativeUsersPercentageBtn");
        if (ativosPercentangeCaption && ativeUsersPercentageBtn) {
            switch (type) {
                case "inactivos":
                    ativeUsersPercentageBtn.title =
                        "Mostrar percentagem de utilizadores inactivos";
                    ativeUsersPercentageBtn.src = "./src/assets/grafico.png";
                    ativosPercentangeCaption.textContent = "inactivos %";
                    break;
                case "utilizadores":
                case "activos":
                    ativeUsersPercentageBtn.title =
                        "Mostrar percentagem de utilizadores activos";
                    ativeUsersPercentageBtn.src = "./src/assets/percentagem.png";
                    ativosPercentangeCaption.textContent = "activos %";
                    break;
                default:
            }
        }
        else {
            console.warn(`Elemento ativosCaption não foi encontrado no DOM.`);
        }
    }
}
