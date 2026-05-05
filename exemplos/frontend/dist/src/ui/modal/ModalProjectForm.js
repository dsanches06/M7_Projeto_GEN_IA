var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Project } from "../../projects/index.js";
import { GlobalValidators } from "../../utils/index.js";
import { ProjectService } from "../../services/index.js";
import { loadProjectsPage } from "../projects/index.js";
import { createButton, createForm, createHeadingTitle, createInputGroup, createSection, } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
function setupProjectFormLogic(form, fields, errors, modal, projectToEdit) {
    form.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // Obter os valores dos campos
        const name = fields.name.value;
        const description = fields.description.value;
        const startDate = fields.startDate.value;
        const endDate = fields.endDate.value;
        // Reset de estados de erro
        errors.nameErr.textContent = "";
        errors.descriptionErr.textContent = "";
        errors.startDateErr.textContent = "";
        errors.endDateErr.textContent = "";
        let isValid = true;
        // Validações
        if (!GlobalValidators.isNonEmpty(name.trim())) {
            errors.nameErr.textContent = "O nome do projeto não pode estar vazio.";
            isValid = false;
        }
        if (!GlobalValidators.minLength(name.trim(), 3)) {
            errors.nameErr.textContent =
                "O nome do projeto deve ter pelo menos 3 caracteres.";
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
            // o estado inicial do projeto será sempre "Ativo" (ID 1) ao ser criado
            const projectStatusId = 1;
            // Criar objeto do projeto (ID 0 será gerado pela base de dados)
            const projectData = new Project((projectToEdit === null || projectToEdit === void 0 ? void 0 : projectToEdit.id) || 0, // ID existente ou placeholder para novo
            name.trim(), description || "", projectStatusId, // Usar o ID do status selecionado
            new Date(startDate), new Date(endDate));
            // Converter para DTO
            const projectDTO = {
                id: projectData.getId(),
                name: projectData.getName(),
                description: projectData.getDescription(),
                project_status_id: projectData.getProjectStatusId(),
                start_date: startDate ? new Date(startDate).toISOString().split("T")[0] : undefined,
                end_date_expected: endDate ? new Date(endDate).toISOString().split("T")[0] : undefined,
            };
            try {
                // Criar ou atualizar projeto via serviço (envia para a API)
                if (projectToEdit) {
                    yield ProjectService.updateProject(projectDTO);
                    showInfoBanner(`INFO: O projeto ${name} foi atualizado com sucesso.`, "info-banner");
                }
                else {
                    yield ProjectService.createProject(projectDTO);
                    showInfoBanner(`INFO: O projeto ${name} foi criado com sucesso.`, "info-banner");
                }
                // Obter todos os projetos e renderizar
                const projects = yield ProjectService.getProjects();
                // Aguardar um pouco para garantir que o backend processou a mudança
                yield new Promise(resolve => setTimeout(resolve, 300));
                loadProjectsPage(projects);
                modal.remove();
            }
            catch (error) {
                const action = projectToEdit ? "atualizar" : "criar";
                showInfoBanner(`ERRO: Não foi possível ${action} o projeto ${name}.`, "error-banner");
                console.error(`Erro ao ${action} projeto:`, error);
            }
        }
        else {
            showInfoBanner(`ERRO: O projeto não foi criado. Verifique os erros no formulário.`, "error-banner");
        }
    });
}
/**
 * Função Principal: Monta o Modal no DOM
 * @param projectToEdit - Projeto existente para edição (opcional). Se não fornecido, modo CREATE
 */
export function renderProjectModal(projectToEdit) {
    return __awaiter(this, void 0, void 0, function* () {
        const modal = createSection("modalProjectForm");
        modal.classList.add("modal");
        const content = createSection("modalProjectContent");
        content.classList.add("modal-content");
        const closeBtn = document.createElement("span");
        closeBtn.classList.add("close");
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => modal.remove();
        const titleHeading = createHeadingTitle("h2", projectToEdit ? "Editar Projeto" : "Adicionar Projeto");
        const form = createForm("formProject");
        // Criação dos campos usando a função auxiliar
        const nameData = createInputGroup("Nome do Projeto", "projectNameInput", "text", "inserir o nome do projeto");
        if (projectToEdit) {
            nameData.input.value = projectToEdit.name;
        }
        // Criar descrição como textarea com 4 linhas
        const descriptionGroup = document.createElement("section");
        descriptionGroup.className = "form-group";
        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "projectDescriptionInput";
        descriptionLabel.textContent = "Descrição";
        const descriptionTextarea = document.createElement("textarea");
        descriptionTextarea.id = "projectDescriptionInput";
        descriptionTextarea.rows = 4;
        descriptionTextarea.placeholder = "inserir a descrição do projeto (opcional)";
        if (projectToEdit) {
            descriptionTextarea.value = projectToEdit.description || "";
        }
        descriptionGroup.append(descriptionLabel, descriptionTextarea);
        const descriptionData = {
            section: descriptionGroup,
            input: descriptionTextarea,
            errorSection: document.createElement("section"),
        };
        descriptionData.errorSection.id = "projectDescriptionInputError";
        descriptionData.errorSection.className = "error-message";
        descriptionGroup.append(descriptionData.errorSection);
        const startDateData = createInputGroup("Data de Início", "projectStartDateInput", "date", "selecionar data de início");
        if (projectToEdit) {
            startDateData.input.value = projectToEdit.start_date || projectToEdit.startDate;
        }
        const endDateData = createInputGroup("Data de Fim Esperada", "projectEndDateInput", "date", "selecionar data de fim");
        if (projectToEdit) {
            endDateData.input.value = projectToEdit.end_date || projectToEdit.endDate;
        }
        const submitBtn = createButton("button", projectToEdit ? "Atualizar Projeto" : "Criar Projeto", "submit");
        form.append(nameData.section, descriptionData.section, startDateData.section, endDateData.section, submitBtn);
        content.append(closeBtn, titleHeading, form);
        modal.append(content);
        document.body.appendChild(modal);
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        // Ligar a lógica ao formulário
        setupProjectFormLogic(form, {
            name: nameData.input,
            description: descriptionData.input,
            startDate: startDateData.input,
            endDate: endDateData.input,
        }, {
            nameErr: nameData.errorSection,
            descriptionErr: descriptionData.errorSection,
            startDateErr: startDateData.errorSection,
            endDateErr: endDateData.errorSection,
        }, modal, projectToEdit);
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
