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
export function showSprintsCounters(type, sprints) {
    return __awaiter(this, void 0, void 0, function* () {
        if (type === "filtrados" && sprints) {
            yield countAllSprints("#allSprintsCounter", sprints.length);
            countFilterSprints("#filterSprintsCounter", type, sprints.length);
        }
        else {
            yield countAllSprints("#allSprintsCounter");
            countFilterSprints("#filterSprintsCounter", type);
        }
    });
}
/* Contador de sprints filtrados */
function countFilterSprints(id, type, count) {
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
/* Contador de todos os sprints */
function countAllSprints(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        const stats = (yield SprintService.getSprintsStats());
        if (section) {
            section.textContent = `${stats.totalSprints}`;
        }
        else {
            console.warn(`Elemento ${id} não foi encontrado no DOM.`);
        }
    });
}
