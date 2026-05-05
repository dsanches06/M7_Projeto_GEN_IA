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
export function showTeamsCounters(type, teams) {
    return __awaiter(this, void 0, void 0, function* () {
        if (type === "filtradas" && teams) {
            yield countAllTeams("#allTeamsCounter", teams.length);
            countFilterTeams("#filterTeamsCounter", type, teams.length);
        }
        else {
            yield countAllTeams("#allTeamsCounter");
            countFilterTeams("#filterTeamsCounter", type);
        }
    });
}
/* Contador de todas as equipes */
function countAllTeams(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield TeamService.getTeamsStats());
        if (section) {
            section.textContent = `${stats.totalTeams}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
/* Contador de equipes filtradas */
function countFilterTeams(id, type, count) {
    const section = document.querySelector(`${id}`);
    if (section) {
        if (count !== undefined) {
            section.textContent = `${count}`;
        }
        else {
            section.textContent = "0";
        }
    }
    else {
        console.warn(`Elemento ${id} não foi encontrado no DOM.`);
    }
}
