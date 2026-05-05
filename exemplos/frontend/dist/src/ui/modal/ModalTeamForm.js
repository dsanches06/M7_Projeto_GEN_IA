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
import { GlobalValidators } from "../../utils/index.js";
import { loadTeamsPage } from "../teams/index.js";
import { createButton, createForm, createHeadingTitle, createInputGroup, createSection, } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
function setupTeamFormLogic(form, fields, errors, modal, teamToEdit) {
    form.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // Obter os valores dos campos
        const name = fields.name.value;
        const description = fields.description.value;
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
                id: (teamToEdit === null || teamToEdit === void 0 ? void 0 : teamToEdit.id) || 0,
                name: name.trim(),
                description: description || "",
                created_at: (teamToEdit === null || teamToEdit === void 0 ? void 0 : teamToEdit.created_at) || new Date().toISOString(),
            };
            try {
                // Criar ou atualizar equipe via serviço (envia para a API)
                if (teamToEdit) {
                    yield TeamService.updateTeam(teamData.id, teamData);
                    showInfoBanner(`INFO: A equipe ${name} foi atualizada com sucesso.`, "info-banner");
                }
                else {
                    yield TeamService.createTeam(teamData);
                    showInfoBanner(`INFO: A equipe ${name} foi criada com sucesso.`, "info-banner");
                }
                // Obter todas as equipes e renderizar
                const teams = yield TeamService.getTeams();
                // Aguardar um pouco para garantir que o backend processou a mudança
                yield new Promise(resolve => setTimeout(resolve, 300));
                loadTeamsPage(teams);
                modal.remove();
            }
            catch (error) {
                const action = teamToEdit ? "atualizar" : "criar";
                showInfoBanner(`ERRO: Não foi possível ${action} a equipe ${name}.`, "error-banner");
                console.error(`Erro ao ${action} equipe:`, error);
            }
        }
        else {
            showInfoBanner(`ERRO: A equipe não foi criada. Verifique os erros no formulário.`, "error-banner");
        }
    });
}
/**
 * Função Principal: Monta o Modal no DOM
 * @param teamToEdit - Equipe existente para edição (opcional). Se não fornecido, modo CREATE
 */
export function renderTeamModal(teamToEdit) {
    return __awaiter(this, void 0, void 0, function* () {
        const modal = createSection("modalTeamForm");
        modal.classList.add("modal");
        const content = createSection("modalTeamContent");
        content.classList.add("modal-content");
        const closeBtn = document.createElement("span");
        closeBtn.classList.add("close");
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => modal.remove();
        const titleHeading = createHeadingTitle("h2", teamToEdit ? "Editar Equipe" : "Adicionar Equipe");
        const form = createForm("formTeam");
        // Criação dos campos usando a função auxiliar
        const nameData = createInputGroup("Nome da Equipe", "teamNameInput", "text", "inserir o nome da equipe");
        if (teamToEdit) {
            nameData.input.value = teamToEdit.name;
        }
        // Criar descrição como textarea com 4 linhas
        const descriptionGroup = document.createElement("section");
        descriptionGroup.className = "form-group";
        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "teamDescriptionInput";
        descriptionLabel.textContent = "Descrição";
        const descriptionTextarea = document.createElement("textarea");
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
        const submitBtn = createButton("button", teamToEdit ? "Atualizar Equipe" : "Criar Equipe", "submit");
        form.append(nameData.section, descriptionData.section, submitBtn);
        content.append(closeBtn, titleHeading, form);
        modal.append(content);
        document.body.appendChild(modal);
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        // Ligar a lógica ao formulário
        setupTeamFormLogic(form, {
            name: nameData.input,
            description: descriptionData.input,
        }, {
            nameErr: nameData.errorSection,
            descriptionErr: descriptionData.errorSection,
        }, modal, teamToEdit);
        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal)
                modal.remove();
        };
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
    });
}
