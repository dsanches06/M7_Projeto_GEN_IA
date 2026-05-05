import { SprintService, ProjectStatusService, ProjectService } from "../../services/index.js";
import { GlobalValidators } from "../../utils/index.js";
import { loadSprintsPage } from "../sprints/index.js";
import { SprintDTORequest } from "../../api/dto/index.js";

import {
  createButton,
  createForm,
  createHeadingTitle,
  createInputGroup,
  createSection,
} from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";

function setupSprintFormLogic(
  form: HTMLFormElement,
  fields: {
    name: HTMLInputElement;
    description: HTMLTextAreaElement;
    startDate: HTMLInputElement;
    endDate: HTMLInputElement;
    statusId: HTMLSelectElement;
  },
  errors: {
    nameErr: HTMLElement;
    descriptionErr: HTMLElement;
    startDateErr: HTMLElement;
    endDateErr: HTMLElement;
  },
  modal: HTMLElement,
  projectId: number,
  sprintToEdit?: any,
): void {
  form.onsubmit = async (e: Event) => {
    e.preventDefault();

    // Obter os valores dos campos
    const name: string = fields.name.value;
    const description: string = fields.description.value;
    const startDate: string = fields.startDate.value;
    const endDate: string = fields.endDate.value;

    // Reset de estados de erro
    errors.nameErr.textContent = "";
    errors.descriptionErr.textContent = "";
    errors.startDateErr.textContent = "";
    errors.endDateErr.textContent = "";

    let isValid = true;

    // Validações
    if (!GlobalValidators.isNonEmpty(name.trim())) {
      errors.nameErr.textContent = "O nome do sprint não pode estar vazio.";
      isValid = false;
    }

    if (!GlobalValidators.minLength(name.trim(), 3)) {
      errors.nameErr.textContent =
        "O nome do sprint deve ter pelo menos 3 caracteres.";
      isValid = false;
    }

    // Datas são opcionais para criação
    // Apenas validar se ambas forem fornecidas
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        errors.endDateErr.textContent =
          "A data de fim deve ser depois da data de início.";
        isValid = false;
      }
    }

    // Verificação Final
    if (isValid) {
      try {
        // Criar DTO do sprint conforme esperado pela API
        let sprintData: any;
        
        if (sprintToEdit) {
          // Para update, incluir o id
          sprintData = {
            id: sprintToEdit.id,
            project_id: projectId,
            name: name.trim(),
            description: description || undefined,
            status_id: parseInt(fields.statusId.value),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          };
          await SprintService.updateSprint(sprintData.id, sprintData);
          showInfoBanner(
            `INFO: O sprint ${name} foi atualizado com sucesso.`,
            "info-banner",
          );
        } else {
          // Para criação, não enviar o id
          sprintData = {
            project_id: projectId,
            name: name.trim(),
            description: description || undefined,
            status_id: parseInt(fields.statusId.value),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          } as Partial<SprintDTORequest>;
          await SprintService.createSprint(sprintData);
          showInfoBanner(
            `INFO: O sprint ${name} foi criado com sucesso.`,
            "info-banner",
          );
        }

        // Verificar se estamos no dashboard do projeto
        const dashboardElement = document.querySelector("#dashboardProject");
        if (dashboardElement) {
          // Estamos no dashboard do projeto, recarregar apenas a seção de sprints
          const sprintsSection = dashboardElement.querySelector(".sprints-section");
          if (sprintsSection) {
            // Importar dinamicamente para evitar dependências circulares
            const { createSprintsSection } = await import("../projects/index.js");
            const newSprintsSection = await createSprintsSection(projectId);
            sprintsSection.replaceWith(newSprintsSection);
          }
        } else {
          // Caso contrário, recarregar a página geral de sprints
          const sprints = await SprintService.getSprints();
          await loadSprintsPage(sprints);
        }

        modal.remove();
      } catch (error) {
        const action = sprintToEdit ? "atualizar" : "criar";
        showInfoBanner(
          `ERRO: Não foi possível ${action} o sprint ${name}.`,
          "error-banner",
        );
        console.error(`Erro ao ${action} sprint:`, error);
      }
    } else {
      showInfoBanner(
        `ERRO: O sprint não foi criado. Verifique os erros no formulário.`,
        "error-banner",
      );
    }
  };
}

/**
 * Função Principal: Monta o Modal no DOM
 * @param projectId - ID do projeto para o qual criar o sprint
 * @param sprintToEdit - Sprint existente para edição (opcional). Se não fornecido, modo CREATE
 */
export async function renderSprintModal(projectId: number, sprintToEdit?: any): Promise<void> {
  const modal = createSection("modalSprintForm") as HTMLElement;
  modal.classList.add("modal");

  const content = createSection("modalSprintContent") as HTMLElement;
  content.classList.add("modal-content");

  const closeBtn = document.createElement("span") as HTMLSpanElement;
  closeBtn.classList.add("close");
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => modal.remove();

  const titleHeading = createHeadingTitle(
    "h2",
    sprintToEdit ? "Editar Sprint" : "Adicionar Sprint",
  ) as HTMLHeadingElement;

  const form = createForm("formSprint") as HTMLFormElement;

  // Criação dos campos usando a função auxiliar
  const nameData = createInputGroup(
    "Nome do Sprint",
    "sprintNameInput",
    "text",
    "inserir o nome do sprint",
  );
  if (sprintToEdit) {
    (nameData.input as HTMLInputElement).value = sprintToEdit.name;
  }

  // Criar descrição como textarea com 4 linhas
  const descriptionGroup = document.createElement("section");
  descriptionGroup.className = "form-group";

  const descriptionLabel = document.createElement("label");
  descriptionLabel.htmlFor = "sprintDescriptionInput";
  descriptionLabel.textContent = "Descrição";

  const descriptionTextarea = document.createElement(
    "textarea",
  ) as HTMLTextAreaElement;
  descriptionTextarea.id = "sprintDescriptionInput";
  descriptionTextarea.rows = 4;
  descriptionTextarea.placeholder = "inserir a descrição do sprint (opcional)";
  if (sprintToEdit) {
    descriptionTextarea.value = sprintToEdit.description || "";
  }

  descriptionGroup.append(descriptionLabel, descriptionTextarea);

  const descriptionData = {
    section: descriptionGroup,
    input: descriptionTextarea,
    errorSection: document.createElement("section"),
  };
  descriptionData.errorSection.id = "sprintDescriptionInputError";
  descriptionData.errorSection.className = "error-message";
  descriptionGroup.append(descriptionData.errorSection);

  const startDateData = createInputGroup(
    "Data de Início",
    "sprintStartDateInput",
    "date",
    "selecionar data de início",
  );
  if (sprintToEdit) {
    (startDateData.input as HTMLInputElement).value = sprintToEdit.start_date;
  }

  const endDateData = createInputGroup(
    "Data de Fim",
    "sprintEndDateInput",
    "date",
    "selecionar data de fim",
  );
  if (sprintToEdit) {
    (endDateData.input as HTMLInputElement).value = sprintToEdit.end_date;
  }

  // Criar select de Status
  const statusGroup = document.createElement("section");
  statusGroup.className = "form-group";

  const statusLabel = document.createElement("label");
  statusLabel.htmlFor = "sprintStatusInput";
  statusLabel.textContent = "Estado";

  const statusSelect = document.createElement(
    "select",
  ) as HTMLSelectElement;
  statusSelect.id = "sprintStatusInput";

  // Carregar estados da API
  try {
    const statuses = await ProjectStatusService.getProjectStatuses();
    const defaultStatusId = sprintToEdit ? sprintToEdit.status_id : 1; // Status atual ou padrão
    statuses.forEach((status: any) => {
      const option = document.createElement("option");
      option.value = String(status.id);
      option.textContent = status.name;
      if (status.id === defaultStatusId) option.selected = true;
      statusSelect.appendChild(option);
    });
  } catch (error) {
    showInfoBanner("Erro ao carregar estados de projeto", "error-banner");
    console.error("Erro ao carregar estados de projeto:", error);
  }

  statusGroup.append(statusLabel, statusSelect);

  const submitBtn = createButton(
    "button",
    sprintToEdit ? "Atualizar Sprint" : "Criar Sprint",
    "submit",
  ) as HTMLButtonElement;

  form.append(
    nameData.section,
    descriptionData.section,
    startDateData.section,
    endDateData.section,
    statusGroup,
    submitBtn,
  );

  content.append(closeBtn, titleHeading, form);
  modal.append(content);
  document.body.appendChild(modal);
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  // Ligar a lógica ao formulário
  setupSprintFormLogic(
    form,
    {
      name: nameData.input,
      description: descriptionData.input,
      startDate: startDateData.input,
      endDate: endDateData.input,
      statusId: statusSelect,
    },
    {
      nameErr: nameData.errorSection,
      descriptionErr: descriptionData.errorSection,
      startDateErr: startDateData.errorSection,
      endDateErr: endDateData.errorSection,
    },
    modal,
    projectId,
    sprintToEdit,
  );

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}
