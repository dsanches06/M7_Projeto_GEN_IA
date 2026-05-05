var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GlobalValidators } from "../../utils/index.js";
import { CategoryService, PriorityService, TaskService, TaskStatusService, TaskTypeService, } from "../../services/index.js";
import { createButton, createForm, createHeadingTitle, createInputGroup, createSection, createSelectGroup, } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
function ensureCategoryId(categoryName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const categories = yield CategoryService.getCategories();
        const existingCategory = categories.find((category) => category.name === categoryName);
        if (existingCategory) {
            return existingCategory.id;
        }
        const createdCategory = yield CategoryService.createCategory({
            name: categoryName,
            flow_order: categories.length + 1,
        });
        return (_a = createdCategory === null || createdCategory === void 0 ? void 0 : createdCategory.id) !== null && _a !== void 0 ? _a : 0;
    });
}
function ensureTaskTypeId(typeName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const taskTypes = yield TaskTypeService.getTaskTypes();
        const existingType = taskTypes.find((taskType) => taskType.name === typeName);
        if (existingType) {
            return existingType.id;
        }
        const createdType = yield TaskTypeService.createTaskType({
            name: typeName,
            flow_order: taskTypes.length + 1,
        });
        return (_a = createdType === null || createdType === void 0 ? void 0 : createdType.id) !== null && _a !== void 0 ? _a : 0;
    });
}
function ensureTaskStatusId(statusName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const taskStatuses = yield TaskStatusService.getTaskStatuses();
        const existingStatus = taskStatuses.find((taskStatus) => taskStatus.name === statusName);
        if (existingStatus) {
            return existingStatus.id;
        }
        const createdStatus = yield TaskStatusService.createTaskStatus({
            id: 0,
            name: statusName,
            flow_order: taskStatuses.length + 1,
        });
        return (_a = createdStatus === null || createdStatus === void 0 ? void 0 : createdStatus.id) !== null && _a !== void 0 ? _a : 0;
    });
}
function ensurePriorityId(priorityName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const priorities = yield PriorityService.getPriorities();
        const existingPriority = priorities.find((priority) => priority.name === priorityName);
        if (existingPriority) {
            return existingPriority.id;
        }
        const createdPriority = yield PriorityService.createPriority({
            name: priorityName,
            flow_order: priorities.length + 1,
        });
        return (_a = createdPriority === null || createdPriority === void 0 ? void 0 : createdPriority.id) !== null && _a !== void 0 ? _a : 0;
    });
}
function setupTaskFormLogic(form, fields, errors, modal, projectId, taskToEdit, user, onSuccess) {
    form.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        const title = fields.title.value;
        const description = fields.description.value;
        const category = fields.category.value;
        const type = fields.type.value;
        const status = fields.status.value;
        const priority = fields.priority.value;
        const estimatedHours = fields.estimatedHours.value;
        // Reset de estados
        errors.titleErr.textContent = "";
        errors.descriptionErr.textContent = "";
        errors.categoryErr.textContent = "";
        errors.typeErr.textContent = "";
        errors.statusErr.textContent = "";
        errors.priorityErr.textContent = "";
        errors.estimatedHoursErr.textContent = "";
        let isValid = true;
        if (!GlobalValidators.minLength(title.trim(), 3)) {
            errors.titleErr.textContent =
                "O título deve ter pelo menos 3 caracteres.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(title.trim())) {
            errors.titleErr.textContent = "O título não pode estar vazio.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(description.trim())) {
            errors.descriptionErr.textContent = "A descrição não pode estar vazia.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(category.trim())) {
            errors.categoryErr.textContent = "A categoria não pode estar vazia.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(type.trim())) {
            errors.typeErr.textContent = "O tipo não pode estar vazio.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(status.trim())) {
            errors.statusErr.textContent = "O status não pode estar vazio.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(priority.trim())) {
            errors.priorityErr.textContent = "A prioridade não pode estar vazia.";
            isValid = false;
        }
        if (!GlobalValidators.isNonEmpty(estimatedHours.trim()) ||
            !GlobalValidators.isPositiveNumber(Number(estimatedHours))) {
            errors.estimatedHoursErr.textContent =
                "As horas estimadas devem ser um número maior que zero.";
            isValid = false;
        }
        if (isValid) {
            const taskId = (_a = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.id) !== null && _a !== void 0 ? _a : (_b = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getId) === null || _b === void 0 ? void 0 : _b.call(taskToEdit);
            const categoryId = yield ensureCategoryId(category.trim());
            const typeId = yield ensureTaskTypeId(type.trim());
            const statusId = yield ensureTaskStatusId(status.trim());
            const priorityId = yield ensurePriorityId(priority.trim());
            const estimatedHoursValue = Number(estimatedHours.trim());
            const taskData = {
                project_id: projectId,
                title: title.trim(),
                description: description.trim(),
                category_id: categoryId,
                types_id: typeId,
                task_status_id: statusId,
                priority_id: priorityId,
                estimated_hours: estimatedHoursValue,
            };
            try {
                if (taskToEdit) {
                    yield TaskService.updateTask(taskId, taskData);
                    showInfoBanner(`INFO: A tarefa "${title}" foi atualizada com sucesso.`, "success-banner");
                }
                else {
                    yield TaskService.createTask(taskData);
                    showInfoBanner(`INFO: A tarefa "${title}" foi criada com sucesso.`, "success-banner");
                }
                // Aguardar um pouco para garantir que o backend processou a mudança
                yield new Promise(resolve => setTimeout(resolve, 300));
                modal.remove();
                if (onSuccess)
                    yield onSuccess();
            }
            catch (error) {
                const action = taskToEdit ? "atualizar" : "criar";
                showInfoBanner(`ERRO: Não foi possível ${action} a tarefa.`, "error-banner");
                console.error(`Erro ao ${action} tarefa:`, error);
            }
        }
        else {
            showInfoBanner(`ERRO: Verifique os erros no formulário.`, "error-banner");
        }
    });
}
/**
 *  Função Principal: Monta o Modal no DOM
 * @param projectId - ID do projeto ao qual a tarefa pertence (obrigatório)
 * @param taskToEdit - Tarefa existente para edição (opcional). Se não fornecido, modo CREATE
 * @param user - Utilizador atual (opcional)
 */
export function renderTaskModal(projectId, taskToEdit, user, onSuccess) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const modal = createSection("modalTaskForm");
        modal.classList.add("modal");
        const content = createSection("modalTaskContent");
        content.classList.add("modal-content");
        const closeBtn = document.createElement("span");
        closeBtn.classList.add("close");
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => modal.remove();
        const titleHeading = createHeadingTitle("h2", taskToEdit ? "Editar Tarefa" : "Adicionar Tarefa");
        const form = createForm("formTask");
        // Criação dos campos usando a função auxiliar
        const titleData = createInputGroup("Titulo", "taskTitleInput", "text", "inserir o titulo da tarefa");
        const titleValue = (_c = (_a = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.title) !== null && _a !== void 0 ? _a : (_b = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getTitle) === null || _b === void 0 ? void 0 : _b.call(taskToEdit)) !== null && _c !== void 0 ? _c : "";
        if (titleValue) {
            titleData.input.value = titleValue;
        }
        const descriptionGroup = document.createElement("section");
        descriptionGroup.className = "form-group";
        const descriptionLabel = document.createElement("label");
        descriptionLabel.setAttribute("for", "taskDescriptionInput");
        descriptionLabel.textContent = "Descrição";
        const descriptionTextarea = document.createElement("textarea");
        descriptionTextarea.id = "taskDescriptionInput";
        descriptionTextarea.placeholder = "inserir a descrição da tarefa";
        descriptionTextarea.rows = 2;
        const descriptionError = document.createElement("section");
        descriptionError.id = "taskDescriptionInputError";
        descriptionError.className = "error-message";
        descriptionGroup.append(descriptionLabel, descriptionTextarea, descriptionError);
        const descriptionValue = (_f = (_d = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.description) !== null && _d !== void 0 ? _d : (_e = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getDescription) === null || _e === void 0 ? void 0 : _e.call(taskToEdit)) !== null && _f !== void 0 ? _f : "";
        if (descriptionValue) {
            descriptionTextarea.value = descriptionValue;
        }
        const categories = yield CategoryService.getCategories().catch(() => []);
        const taskCategory = categories.length > 0
            ? categories.map((category) => category.name)
            : ["Trabalho", "Pessoal", "Estudo"];
        const categoryData = createSelectGroup("Categoria", "categoryID", taskCategory);
        const categoryValue = (_k = (_g = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.category) !== null && _g !== void 0 ? _g : (_j = (_h = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getTaskCategory) === null || _h === void 0 ? void 0 : _h.call(taskToEdit)) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : "";
        if (categoryValue) {
            categoryData.select.value = categoryValue;
        }
        const taskTypes = yield TaskTypeService.getTaskTypes().catch(() => []);
        const typeOptions = taskTypes.length > 0
            ? taskTypes.map((taskType) => taskType.name)
            : ["Bugs", "Feature", "Task"];
        const TypeData = createSelectGroup("Tipo", "typeID", typeOptions);
        const typeValue = (_o = (_l = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.type) !== null && _l !== void 0 ? _l : (_m = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getType) === null || _m === void 0 ? void 0 : _m.call(taskToEdit)) !== null && _o !== void 0 ? _o : "";
        if (typeValue) {
            TypeData.select.value = typeValue;
        }
        const taskStatuses = yield TaskStatusService.getTaskStatuses().catch(() => []);
        const statusOptions = taskStatuses.length > 0
            ? taskStatuses.map((status) => status.name)
            : ["Backlog", "Pendente", "Em Progresso", "Revisão", "Concluida"];
        const statusData = createSelectGroup("Status", "statusID", statusOptions);
        const statusValue = (_p = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.status_id) !== null && _p !== void 0 ? _p : null;
        if (statusValue && taskStatuses.length > 0) {
            const selectedStatus = taskStatuses.find((status) => status.id === statusValue);
            if (selectedStatus) {
                statusData.select.value = selectedStatus.name;
            }
        }
        const priorities = yield PriorityService.getPriorities().catch(() => []);
        const priorityOptions = priorities.length > 0
            ? priorities.map((priority) => priority.name)
            : ["Baixa", "Médio", "Alta", "Critica"];
        const priorityData = createSelectGroup("Prioridade", "priorityID", priorityOptions);
        const priorityValue = (_q = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.priority_id) !== null && _q !== void 0 ? _q : null;
        if (priorityValue && priorities.length > 0) {
            const selectedPriority = priorities.find((priority) => priority.id === priorityValue);
            if (selectedPriority) {
                priorityData.select.value = selectedPriority.name;
            }
        }
        const estimatedHoursData = createInputGroup("Horas Estimadas", "taskEstimatedHoursInput", "number", "0.00");
        estimatedHoursData.input.min = "0";
        estimatedHoursData.input.step = "0.25";
        const estimatedHoursValue = (_t = (_r = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.estimated_hours) !== null && _r !== void 0 ? _r : (_s = taskToEdit === null || taskToEdit === void 0 ? void 0 : taskToEdit.getEstimatedHours) === null || _s === void 0 ? void 0 : _s.call(taskToEdit)) !== null && _t !== void 0 ? _t : "";
        if (estimatedHoursValue !== undefined && estimatedHoursValue !== null) {
            estimatedHoursData.input.value =
                String(estimatedHoursValue);
        }
        const submitBtn = createButton("button", taskToEdit ? "Atualizar" : "Adicionar", "submit");
        // Criar containers para campos lado a lado
        const categoryTypeRow = document.createElement("div");
        categoryTypeRow.className = "form-fields-row";
        categoryTypeRow.append(categoryData.section, TypeData.section);
        const statusPriorityRow = document.createElement("div");
        statusPriorityRow.className = "form-fields-row";
        statusPriorityRow.append(statusData.section, priorityData.section);
        form.append(titleData.section, descriptionGroup, categoryTypeRow, statusPriorityRow, estimatedHoursData.section, submitBtn);
        content.append(closeBtn, titleHeading, form);
        modal.append(content);
        document.body.appendChild(modal);
        // Ligar a lógica ao formulário
        setupTaskFormLogic(form, {
            title: titleData.input,
            description: descriptionTextarea,
            category: categoryData.select,
            type: TypeData.select,
            status: statusData.select,
            priority: priorityData.select,
            estimatedHours: estimatedHoursData.input,
        }, {
            titleErr: titleData.errorSection,
            descriptionErr: descriptionError,
            categoryErr: categoryData.errorSection,
            typeErr: TypeData.errorSection,
            statusErr: statusData.errorSection,
            priorityErr: priorityData.errorSection,
            estimatedHoursErr: estimatedHoursData.errorSection,
        }, modal, projectId, taskToEdit, user, onSuccess);
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
