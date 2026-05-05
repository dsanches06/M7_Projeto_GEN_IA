import { TagService } from "../../services/index.js";
import {
  addElementInContainer,
  createSection,
  createHeadingTitle,
  createStatisticsCounter,
  createSearchContainer,
  createButton,
  createInput,
  clearContainer,
} from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { renderTagsList, showTagsCounters } from "./index.js";

/* Página de gestão de tags */
export async function loadTagsPage(tags: any[]): Promise<void> {
  clearContainer("#containerSection");

  addElementInContainer(
    "#containerSection",
    createHeadingTitle("h2", "GESTÃO DE TAGS"),
  );

  const tagCounterSection = createTagCounter("tagCounters");
  addElementInContainer("#containerSection", tagCounterSection);
  await showTagsCounters("tags");

  const searchContainer = showSearchTagContainer();
  addElementInContainer("#containerSection", searchContainer);

  const createTagSection = createTagInputSection();
  addElementInContainer("#containerSection", createTagSection);

  const allTags = await TagService.getTags();
  const tagsContainer = await renderTagsList(allTags);
  addElementInContainer("#containerSection", tagsContainer);

  // Event listeners para busca
  const searchTagInput = document.querySelector(
    "#searchTag",
  ) as HTMLInputElement | null;

  if (searchTagInput) {
    searchTagInput.addEventListener("input", async () => {
      const query = searchTagInput.value.trim().toLowerCase();
      const allTags = await TagService.getTags();
      const filteredTags = allTags.filter((tag: any) =>
        (tag.name || "").toLowerCase().includes(query),
      );
      clearContainer("#tagsListContainer");
      const tagsContainer = await renderTagsList(filteredTags);
      const oldContainer = document.querySelector("#tagsListContainer");
      if (oldContainer) {
        oldContainer.replaceWith(tagsContainer);
      } else {
        addElementInContainer("#containerSection", tagsContainer);
      }
      await showTagsCounters("filtradas", filteredTags);
    });
  }

  // Event listeners para sorting
  const sortTagsBtn = document.querySelector("#sortTagsBtn") as HTMLElement;
  if (sortTagsBtn) {
    let isAscending = true;
    sortTagsBtn.addEventListener("click", async () => {
      const allTags = await TagService.getTags();
      const sortedTags = allTags.sort((a: any, b: any) => {
        const comparison = (a.name || "").localeCompare(b.name || "");
        return isAscending ? comparison : -comparison;
      });
      isAscending = !isAscending;
      clearContainer("#tagsListContainer");
      const tagsContainer = await renderTagsList(sortedTags);
      const oldContainer = document.querySelector("#tagsListContainer");
      if (oldContainer) {
        oldContainer.replaceWith(tagsContainer);
      } else {
        addElementInContainer("#containerSection", tagsContainer);
      }
      sortTagsBtn.textContent = isAscending ? "Ordenar Z-A" : "Ordenar A-Z";
    });
  }

  // Event listeners para criar tag
  const createTagBtn = document.querySelector("#createTagBtn") as HTMLElement;
  const newTagNameInput = document.querySelector(
    "#newTagName",
  ) as HTMLInputElement;
  const newTagError = document.querySelector(
    "#newTagNameError",
  ) as HTMLElement;

  if (createTagBtn) {
    createTagBtn.addEventListener("click", async () => {
      newTagError.textContent = "";
      const name = newTagNameInput.value.trim();

      if (!name) {
        newTagError.textContent = "Informe um nome para a tag.";
        return;
      }

      try {
        await TagService.createTag({ name });
        showInfoBanner(`Tag "${name}" criada com sucesso.`, "success-banner");
        newTagNameInput.value = "";
        const allTags = await TagService.getTags();
        clearContainer("#tagsListContainer");
        const tagsContainer = await renderTagsList(allTags);
        const oldContainer = document.querySelector("#tagsListContainer");
        if (oldContainer) {
          oldContainer.replaceWith(tagsContainer);
        } else {
          addElementInContainer("#containerSection", tagsContainer);
        }
        await showTagsCounters("tags");
      } catch (error) {
        showInfoBanner("Erro ao criar tag.", "error-banner");
        console.error(error);
      }
    });
  }
}

/* Criar seção de contadores */
function createTagCounter(id: string): HTMLElement {
  const allTagsBtn = createStatisticsCounter(
    "allTagsSection",
    "allTagsBtn",
    "./src/assets/tarefa.png",
    "tags",
    "allTagsCounter",
  ) as HTMLElement;

  const filterTagsBtn = createStatisticsCounter(
    "filterTagsSection",
    "filterTagsBtn",
    "./src/assets/filter.png",
    "filtradas",
    "filterTagsCounter",
  ) as HTMLElement;

  const sectionTagsCounter = createSection(`${id}`) as HTMLElement;
  sectionTagsCounter.classList.add("tags-counters");
  sectionTagsCounter.append(allTagsBtn, filterTagsBtn);
  return sectionTagsCounter;
}

/* Criar container de busca e ordenação */
function showSearchTagContainer(): HTMLElement {
  const searchTagContainer = createSearchContainer(
    "searchTagContainer",
    { id: "searchTag", placeholder: "Procurar tag..." },
    [{ id: "sortTagsBtn", text: "Ordenar A-Z" }],
  );
  searchTagContainer.classList.add("search-add-container");
  return searchTagContainer;
}

/* Criar seção para adicionar nova tag */
function createTagInputSection(): HTMLElement {
  const createInputSection = createSection("tagCreateSection");
  createInputSection.classList.add("form-group");

  const tagLabel = document.createElement("label");
  tagLabel.setAttribute("for", "newTagName");
  tagLabel.textContent = "Nome da tag";

  const createRow = document.createElement("div");
  createRow.className = "tag-create-row";

  const newTagName = createInput("newTagName", "text") as HTMLInputElement;
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
