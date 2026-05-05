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
import { addElementInContainer, createSection, createHeadingTitle, createStatisticsCounter, createSearchContainer, createButton, createInput, clearContainer, } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { renderTagsList, showTagsCounters } from "./index.js";
/* Página de gestão de tags */
export function loadTagsPage(tags) {
    return __awaiter(this, void 0, void 0, function* () {
        clearContainer("#containerSection");
        addElementInContainer("#containerSection", createHeadingTitle("h2", "GESTÃO DE TAGS"));
        const tagCounterSection = createTagCounter("tagCounters");
        addElementInContainer("#containerSection", tagCounterSection);
        yield showTagsCounters("tags");
        const searchContainer = showSearchTagContainer();
        addElementInContainer("#containerSection", searchContainer);
        const createTagSection = createTagInputSection();
        addElementInContainer("#containerSection", createTagSection);
        const allTags = yield TagService.getTags();
        const tagsContainer = yield renderTagsList(allTags);
        addElementInContainer("#containerSection", tagsContainer);
        // Event listeners para busca
        const searchTagInput = document.querySelector("#searchTag");
        if (searchTagInput) {
            searchTagInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
                const query = searchTagInput.value.trim().toLowerCase();
                const allTags = yield TagService.getTags();
                const filteredTags = allTags.filter((tag) => (tag.name || "").toLowerCase().includes(query));
                clearContainer("#tagsListContainer");
                const tagsContainer = yield renderTagsList(filteredTags);
                const oldContainer = document.querySelector("#tagsListContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(tagsContainer);
                }
                else {
                    addElementInContainer("#containerSection", tagsContainer);
                }
                yield showTagsCounters("filtradas", filteredTags);
            }));
        }
        // Event listeners para sorting
        const sortTagsBtn = document.querySelector("#sortTagsBtn");
        if (sortTagsBtn) {
            let isAscending = true;
            sortTagsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const allTags = yield TagService.getTags();
                const sortedTags = allTags.sort((a, b) => {
                    const comparison = (a.name || "").localeCompare(b.name || "");
                    return isAscending ? comparison : -comparison;
                });
                isAscending = !isAscending;
                clearContainer("#tagsListContainer");
                const tagsContainer = yield renderTagsList(sortedTags);
                const oldContainer = document.querySelector("#tagsListContainer");
                if (oldContainer) {
                    oldContainer.replaceWith(tagsContainer);
                }
                else {
                    addElementInContainer("#containerSection", tagsContainer);
                }
                sortTagsBtn.textContent = isAscending ? "Ordenar Z-A" : "Ordenar A-Z";
            }));
        }
        // Event listeners para criar tag
        const createTagBtn = document.querySelector("#createTagBtn");
        const newTagNameInput = document.querySelector("#newTagName");
        const newTagError = document.querySelector("#newTagNameError");
        if (createTagBtn) {
            createTagBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                newTagError.textContent = "";
                const name = newTagNameInput.value.trim();
                if (!name) {
                    newTagError.textContent = "Informe um nome para a tag.";
                    return;
                }
                try {
                    yield TagService.createTag({ name });
                    showInfoBanner(`Tag "${name}" criada com sucesso.`, "success-banner");
                    newTagNameInput.value = "";
                    const allTags = yield TagService.getTags();
                    clearContainer("#tagsListContainer");
                    const tagsContainer = yield renderTagsList(allTags);
                    const oldContainer = document.querySelector("#tagsListContainer");
                    if (oldContainer) {
                        oldContainer.replaceWith(tagsContainer);
                    }
                    else {
                        addElementInContainer("#containerSection", tagsContainer);
                    }
                    yield showTagsCounters("tags");
                }
                catch (error) {
                    showInfoBanner("Erro ao criar tag.", "error-banner");
                    console.error(error);
                }
            }));
        }
    });
}
/* Criar seção de contadores */
function createTagCounter(id) {
    const allTagsBtn = createStatisticsCounter("allTagsSection", "allTagsBtn", "./src/assets/tarefa.png", "tags", "allTagsCounter");
    const filterTagsBtn = createStatisticsCounter("filterTagsSection", "filterTagsBtn", "./src/assets/filter.png", "filtradas", "filterTagsCounter");
    const sectionTagsCounter = createSection(`${id}`);
    sectionTagsCounter.classList.add("tags-counters");
    sectionTagsCounter.append(allTagsBtn, filterTagsBtn);
    return sectionTagsCounter;
}
/* Criar container de busca e ordenação */
function showSearchTagContainer() {
    const searchTagContainer = createSearchContainer("searchTagContainer", { id: "searchTag", placeholder: "Procurar tag..." }, [{ id: "sortTagsBtn", text: "Ordenar A-Z" }]);
    searchTagContainer.classList.add("search-add-container");
    return searchTagContainer;
}
/* Criar seção para adicionar nova tag */
function createTagInputSection() {
    const createInputSection = createSection("tagCreateSection");
    createInputSection.classList.add("form-group");
    const tagLabel = document.createElement("label");
    tagLabel.setAttribute("for", "newTagName");
    tagLabel.textContent = "Nome da tag";
    const createRow = document.createElement("div");
    createRow.className = "tag-create-row";
    const newTagName = createInput("newTagName", "text");
    newTagName.placeholder = "Ex: Urgente";
    newTagName.autocomplete = "off";
    const createTagBtn = createButton("createTagBtn", "Criar tag", "button");
    createTagBtn.classList.add("btn", "primary");
    createRow.append(newTagName, createTagBtn);
    const newTagError = createSection("newTagNameError");
    newTagError.className = "error-message";
    createInputSection.append(tagLabel, createRow, newTagError);
    return createInputSection;
}
