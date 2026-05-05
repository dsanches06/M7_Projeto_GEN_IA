import { TeamService } from "../../services/index.js";
import { GlobalValidators } from "../../utils/index.js";
import { loadTeamsPage } from "../teams/index.js";

import {
  createButton,
  createForm,
  createHeadingTitle,
  createInputGroup,
  createSection,
} from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";

function setupTeamFormLogic(
  form: HTMLFormElement,
  fields: {
    name: HTMLInputElement;
    description: HTMLTextAreaElement;
  },
  errors: {
    nameErr: HTMLElement;
    descriptionErr: HTMLElement;
  },
  modal: HTMLElement,
  teamToEdit?: any,
): void {
  form.onsubmit = async (e: Event) => {
    e.preventDefault();

    // Obter os valores dos campos
    const name: string = fields.name.value;
    const description: string = fields.description.value;

    // Reset de estados de erro
    errors.nameErr.textContent = "";
    errors.descriptionErr.textContent = "";

    let isValid = true;

    // Validações
    if (!GlobalValidators.isNonEmpty(name.trim())) {
      errors.nameErr.textContent = "O nome da equipe não pode estar vazio.";
      isValid = false;
    }

    if (!GlobalValidators.minLength(name.trim(), 3)) {
      errors.nameErr.textContent =
        "O nome da equipe deve ter pelo menos 3 caracteres.";
      isValid = false;
    }

    // Verificação Final
    if (isValid) {
      // Criar objeto da equipe (ID 0 será gerado pela base de dados)
      const teamData = {
        id: teamToEdit?.id || 0,
        name: name.trim(),
        description: description || "",
        created_at: teamToEdit?.created_at || new Date().toISOString(),
      };

      try {
        // Criar ou atualizar equipe via serviço (envia para a API)
        if (teamToEdit) {
          await TeamService.updateTeam(teamData.id, teamData);
          showInfoBanner(
            `INFO: A equipe ${name} foi atualizada com sucesso.`,
            "info-banner",
          );
        } else {
          await TeamService.createTeam(teamData);
          showInfoBanner(
            `INFO: A equipe ${name} foi criada com sucesso.`,
            "info-banner",
          );
        }

        // Obter todas as equipes e renderizar
        const teams = await TeamService.getTeams();
        
        // Aguardar um pouco para garantir que o backend processou a mudança
        await new Promise(resolve => setTimeout(resolve, 300));
        
        loadTeamsPage(teams);

        modal.remove();
      } catch (error) {
        const action = teamToEdit ? "atualizar" : "criar";
        showInfoBanner(
          `ERRO: Não foi possível ${action} a equipe ${name}.`,
          "error-banner",
        );
        console.error(`Erro ao ${action} equipe:`, error);
      }
    } else {
      showInfoBanner(
        `ERRO: A equipe não foi criada. Verifique os erros no formulário.`,
        "error-banner",
      );
    }
  };
}

/**
 * Função Principal: Monta o Modal no DOM
 * @param teamToEdit - Equipe existente para edição (opcional). Se não fornecido, modo CREATE
 */
export async function renderTeamModal(teamToEdit?: any): Promise<void> {
  const modal = createSection("modalTeamForm") as HTMLElement;
  modal.classList.add("modal");

  const content = createSection("modalTeamContent") as HTMLElement;
  content.classList.add("modal-content");

  const closeBtn = document.createElement("span") as HTMLSpanElement;
  closeBtn.classList.add("close");
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => modal.remove();

  const titleHeading = createHeadingTitle(
    "h2",
    teamToEdit ? "Editar Equipe" : "Adicionar Equipe",
  ) as HTMLHeadingElement;

  const form = createForm("formTeam") as HTMLFormElement;

  // Criação dos campos usando a função auxiliar
  const nameData = createInputGroup(
    "Nome da Equipe",
    "teamNameInput",
    "text",
    "inserir o nome da equipe",
  );
  if (teamToEdit) {
    (nameData.input as HTMLInputElement).value = teamToEdit.name;
  }

  // Criar descrição como textarea com 4 linhas
  const descriptionGroup = document.createElement("section");
  descriptionGroup.className = "form-group";

  const descriptionLabel = document.createElement("label");
  descriptionLabel.htmlFor = "teamDescriptionInput";
  descriptionLabel.textContent = "Descrição";

  const descriptionTextarea = document.createElement(
    "textarea",
  ) as HTMLTextAreaElement;
  descriptionTextarea.id = "teamDescriptionInput";
  descriptionTextarea.rows = 4;
  descriptionTextarea.placeholder = "inserir a descrição da equipe (opcional)";
  if (teamToEdit) {
    descriptionTextarea.value = teamToEdit.description || "";
  }

  descriptionGroup.append(descriptionLabel, descriptionTextarea);

  const descriptionData = {
    section: descriptionGroup,
    input: descriptionTextarea,
    errorSection: document.createElement("section"),
  };
  descriptionData.errorSection.id = "teamDescriptionInputError";
  descriptionData.errorSection.className = "error-message";
  descriptionGroup.append(descriptionData.errorSection);

  const submitBtn = createButton(
    "button",
    teamToEdit ? "Atualizar Equipe" : "Criar Equipe",
    "submit",
  ) as HTMLButtonElement;

  form.append(
    nameData.section,
    descriptionData.section,
    submitBtn,
  );

  content.append(closeBtn, titleHeading, form);
  modal.append(content);
  document.body.appendChild(modal);
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  // Ligar a lógica ao formulário
  setupTeamFormLogic(
    form,
    {
      name: nameData.input,
      description: descriptionData.input,
    },
    {
      nameErr: nameData.errorSection,
      descriptionErr: descriptionData.errorSection,
    },
    modal,
    teamToEdit,
  );

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}
