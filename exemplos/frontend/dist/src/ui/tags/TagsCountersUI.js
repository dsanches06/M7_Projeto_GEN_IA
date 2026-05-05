var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TagService } from "../../services/index.js";
export function showTagsCounters(type, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((type === "filtradas" || type === "tags") && tags) {
            countAllTags("#allTagsCounter", tags.length);
            countFilteredTags("#filterTagsCounter", type, tags.length);
        }
        else {
            yield countAllTags("#allTagsCounter");
            countFilteredTags("#filterTagsCounter", type);
        }
    });
}
function countAllTags(id, overrideValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = document.querySelector(`${id}`);
        if (overrideValue !== undefined) {
            if (section) {
                section.textContent = `${overrideValue}`;
            }
            return;
        }
        try {
            const tags = yield TagService.getTags();
            if (section) {
                section.textContent = `${tags.length}`;
            }
        }
        catch (error) {
            console.error("Erro ao contar tags:", error);
            if (section) {
                section.textContent = "0";
            }
        }
    });
}
function countFilteredTags(id, type, overrideValue) {
    const section = document.querySelector(`${id}`);
    if (section) {
        if (overrideValue !== undefined) {
            section.textContent = `${overrideValue}`;
        }
        else {
            section.textContent = "0";
        }
    }
}
