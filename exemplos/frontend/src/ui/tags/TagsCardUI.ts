import { TagService } from "../../services/index.js";
import { showConfirmDialog, showInfoBanner } from "../../helpers/index.js";
import { activateMenu } from "../dom/index.js";
import { loadTagsPage } from "./TagsPageUI.js";

export async function createTagCard(tag: any): Promise<HTMLElement> {
  return await buildTagCard(tag);
}

export async function renderTagsList(tags: any[]): Promise<HTMLElement> {
  const container = document.createElement("div");
  container.id = "tagsListContainer";
  container.classList.add("grid-card-container");

  if (tags.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nenhuma tag encontrada.";
    container.appendChild(emptyMessage);
    return container;
  }

  for (const tag of tags) {
    const tagCard = await createTagCard(tag);
    container.appendChild(tagCard);
  }
  return container;
}

async function buildTagCard(tag: any): Promise<HTMLElement> {
  const card = document.createElement("div");
  card.className = "task-card tag-card";
  card.setAttribute("data-tag-id", tag.id.toString());
  card.style.display = "flex";
  card.style.gap = "1rem";
  card.style.alignItems = "flex-start";

  // Container principal flexível: conteúdo à esquerda, botões à direita
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "tag-card-row";
  contentWrapper.style.display = "flex";
  contentWrapper.style.flexDirection = "column";
  contentWrapper.style.gap = "1rem";

  // ID
  const idSpan = document.createElement("span");
  idSpan.className = "number";
  idSpan.textContent = tag.id.toString();

  // Nome
  const nameSpan = document.createElement("span");
  nameSpan.className = "task-title";
  nameSpan.textContent = tag.name || "Tag sem nome";

  contentWrapper.append(idSpan, nameSpan);

  // Botões (direita)
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "0.35rem";
  buttonContainer.style.alignItems = "flex-end";
  buttonContainer.style.flexShrink = "0";

  card.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest(".icon-button")) {
      return;
    }
    renderTagEditModal(tag);
  });

  // Botão de editar
  const editBtn = document.createElement("button");
  editBtn.className = "icon-button";
  editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
  editBtn.title = "Editar tag";
  editBtn.setAttribute("aria-label", "Editar tag");
  editBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await renderTagEditModal(tag);
  });

  // Botão de excluir
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-button";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.title = "Excluir tag";
  deleteBtn.setAttribute("aria-label", "Excluir tag");
  deleteBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    const shouldDelete = await showConfirmDialog(
      `Tem certeza que deseja excluir a tag "${tag.name}"?`,
    );
    if (!shouldDelete) {
      return;
    }

    try {
      await TagService.deleteTag(tag.id);
      showInfoBanner(`Tag "${tag.name}" removida.`, "success-banner");
      const allTags = await TagService.getTags();
      activateMenu("#menuTags");
      await loadTagsPage(allTags);
    } catch (error) {
      showInfoBanner("Erro ao excluir tag.", "error-banner");
      console.error(error);
    }
  });

  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);

  // Monta a linha principal: conteúdo à esquerda, botões à direita
  card.append(contentWrapper, buttonContainer);

  return card;
}

async function renderTagEditModal(tag: any): Promise<void> {
  const modal = document.createElement("section");
  modal.className = "tag-modal";

  const content = document.createElement("div");
  content.className = "modal-content";

  const closeBtn = document.createElement("span");
  closeBtn.className = "close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => modal.remove());

  const title = document.createElement("h2");
  title.textContent = "Editar tag";

  const description = document.createElement("p");
  description.textContent = "Atualize o nome da tag abaixo.";
  description.style.margin = "0.5rem 0";
  description.style.color = "#666";

  const input = document.createElement("input") as HTMLInputElement;
  input.type = "text";
  input.value = tag.name || "";
  input.placeholder = "Nome da tag";
  input.className = "tag-modal-input";

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "tag-modal-buttons";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "tag-modal-cancel";
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => modal.remove());

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "tag-modal-save";
  saveButton.textContent = "Salvar";
  saveButton.addEventListener("click", async () => {
    const newName = input.value.trim();
    if (!newName) {
      input.focus();
      return;
    }

    try {
      await TagService.updateTag(tag.id, { name: newName });
      showInfoBanner(`Tag atualizada para "${newName}".`, "success-banner");
      const allTags = await TagService.getTags();
      activateMenu("#menuTags");
      await loadTagsPage(allTags);
      modal.remove();
    } catch (error) {
      showInfoBanner("Erro ao atualizar tag.", "error-banner");
      console.error(error);
    }
  });

  buttonGroup.append(cancelButton, saveButton);
  content.append(closeBtn, title, description, input, buttonGroup);
  modal.appendChild(content);
  document.body.appendChild(modal);
  input.focus();

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}
