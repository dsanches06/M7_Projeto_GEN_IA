import { IUser } from "../../models/index.js";
import { GlobalValidators } from "../../utils/index.js";
import {
  CategoryService,
  PriorityService,
  TaskService,
  TaskStatusService,
  TaskTypeService,
} from "../../services/index.js";

import {
  createButton,
  createForm,
  createHeadingTitle,
  createInputGroup,
  createSection,
  createSelectGroup,
} from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";

async function ensureCategoryId(categoryName: string): Promise<number> {
  const categories = await CategoryService.getCategories();
  const existingCategory = categories.find(
    (category) => category.name === categoryName,
  );

  if (existingCategory) {
    return existingCategory.id;
  }

  const createdCategory = await CategoryService.createCategory({
    name: categoryName,
    flow_order: categories.length + 1,
  });

  return createdCategory?.id ?? 0;
}

async function ensureTaskTypeId(typeName: string): Promise<number> {
  const taskTypes = await TaskTypeService.getTaskTypes();
  const existingType = taskTypes.find((taskType) => taskType.name === typeName);

  if (existingType) {
    return existingType.id;
  }

  const createdType = await TaskTypeService.createTaskType({
    name: typeName,
    flow_order: taskTypes.length + 1,
  });

  return createdType?.id ?? 0;
}

async function ensureTaskStatusId(statusName: string): Promise<number> {
  const taskStatuses = await TaskStatusService.getTaskStatuses();
  const existingStatus = taskStatuses.find(
    (taskStatus) => taskStatus.name === statusName,
  );

  if (existingStatus) {
    return existingStatus.id;
  }

  const createdStatus = await TaskStatusService.createTaskStatus({
    id: 0,
    name: statusName,
    flow_order: taskStatuses.length + 1,
  });

  return createdStatus?.id ?? 0;
}

async function ensurePriorityId(priorityName: string): Promise<number> {
  const priorities = await PriorityService.getPriorities();
  const existingPriority = priorities.find(
    (priority) => priority.name === priorityName,
  );

  if (existingPriority) {
    return existingPriority.id;
  }

  const createdPriority = await PriorityService.createPriority({
    name: priorityName,
    flow_order: priorities.length + 1,
  });

  return createdPriority?.id ?? 0;
}

function setupTaskFormLogic(
  form: HTMLFormElement,
  fields: {
    title: HTMLInputElement;
    description: HTMLTextAreaElement;
    category: HTMLSelectElement;
    type: HTMLSelectElement;
    status: HTMLSelectElement;
    priority: HTMLSelectElement;
    estimatedHours: HTMLInputElement;
  },
  errors: {
    titleErr: HTMLElement;
    descriptionErr: HTMLElement;
    categoryErr: HTMLElement;
    typeErr: HTMLElement;
    statusErr: HTMLElement;
    priorityErr: HTMLElement;
    estimatedHoursErr: HTMLElement;
  },
  modal: HTMLElement,
  projectId: number,
  taskToEdit?: any,
  user?: IUser,
  onSuccess?: () => Promise<void> | void,
): void {
  form.onsubmit = async (e: Event) => {
    e.preventDefault();

    const title: string = fields.title.value;
    const description: string = fields.description.value;
    const category: string = fields.category.value;
    const type: string = fields.type.value;
    const status: string = fields.status.value;
    const priority: string = fields.priority.value;
    const estimatedHours: string = fields.estimatedHours.value;

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

    if (
      !GlobalValidators.isNonEmpty(estimatedHours.trim()) ||
      !GlobalValidators.isPositiveNumber(Number(estimatedHours))
    ) {
      errors.estimatedHoursErr.textContent =
        "As horas estimadas devem ser um número maior que zero.";
      isValid = false;
    }

    if (isValid) {
      const taskId = taskToEdit?.id ?? taskToEdit?.getId?.();
      const categoryId = await ensureCategoryId(category.trim());
      const typeId = await ensureTaskTypeId(type.trim());
      const statusId = await ensureTaskStatusId(status.trim());
      const priorityId = await ensurePriorityId(priority.trim());
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
          await TaskService.updateTask(taskId, taskData);

          showInfoBanner(
            `INFO: A tarefa "${title}" foi atualizada com sucesso.`,
            "success-banner",
          );
        } else {
          await TaskService.createTask(taskData);

          showInfoBanner(
            `INFO: A tarefa "${title}" foi criada com sucesso.`,
            "success-banner",
          );
        }
        
        // Aguardar um pouco para garantir que o backend processou a mudança
        await new Promise(resolve => setTimeout(resolve, 300));
        
        modal.remove();
        if (onSuccess) await onSuccess();
      } catch (error) {
        const action = taskToEdit ? "atualizar" : "criar";
        showInfoBanner(
          `ERRO: Não foi possível ${action} a tarefa.`,
          "error-banner",
        );
        console.error(`Erro ao ${action} tarefa:`, error);
      }
    } else {
      showInfoBanner(`ERRO: Verifique os erros no formulário.`, "error-banner");
    }
  };
}

/**
 *  Função Principal: Monta o Modal no DOM
 * @param projectId - ID do projeto ao qual a tarefa pertence (obrigatório)
 * @param taskToEdit - Tarefa existente para edição (opcional). Se não fornecido, modo CREATE
 * @param user - Utilizador atual (opcional)
 */
export async function renderTaskModal(
  projectId: number,
  taskToEdit?: any,
  user?: IUser,
  onSuccess?: () => Promise<void> | void,
): Promise<void> {
  const modal = createSection("modalTaskForm") as HTMLElement;
  modal.classList.add("modal");

  const content = createSection("modalTaskContent") as HTMLElement;
  content.classList.add("modal-content");

  const closeBtn = document.createElement("span") as HTMLSpanElement;
  closeBtn.classList.add("close");
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => modal.remove();

  const titleHeading = createHeadingTitle(
    "h2",
    taskToEdit ? "Editar Tarefa" : "Adicionar Tarefa",
  ) as HTMLHeadingElement;

  const form = createForm("formTask") as HTMLFormElement;

  // Criação dos campos usando a função auxiliar
  const titleData = createInputGroup(
    "Titulo",
    "taskTitleInput",
    "text",
    "inserir o titulo da tarefa",
  );
  const titleValue = taskToEdit?.title ?? taskToEdit?.getTitle?.() ?? "";
  if (titleValue) {
    (titleData.input as HTMLInputElement).value = titleValue;
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
  descriptionGroup.append(
    descriptionLabel,
    descriptionTextarea,
    descriptionError,
  );
  const descriptionValue =
    taskToEdit?.description ?? taskToEdit?.getDescription?.() ?? "";
  if (descriptionValue) {
    descriptionTextarea.value = descriptionValue;
  }

  const categories = await CategoryService.getCategories().catch(() => []);
  const taskCategory =
    categories.length > 0
      ? categories.map((category) => category.name)
      : ["Trabalho", "Pessoal", "Estudo"];
  const categoryData = createSelectGroup(
    "Categoria",
    "categoryID",
    taskCategory,
  );
  const categoryValue =
    taskToEdit?.category ?? taskToEdit?.getTaskCategory?.()?.name ?? "";
  if (categoryValue) {
    categoryData.select.value = categoryValue;
  }

  const taskTypes = await TaskTypeService.getTaskTypes().catch(() => []);
  const typeOptions =
    taskTypes.length > 0
      ? taskTypes.map((taskType) => taskType.name)
      : ["Bugs", "Feature", "Task"];
  const TypeData = createSelectGroup("Tipo", "typeID", typeOptions);
  const typeValue = taskToEdit?.type ?? taskToEdit?.getType?.() ?? "";
  if (typeValue) {
    TypeData.select.value = typeValue;
  }

  const taskStatuses = await TaskStatusService.getTaskStatuses().catch(
    () => [],
  );
  const statusOptions =
    taskStatuses.length > 0
      ? taskStatuses.map((status) => status.name)
      : ["Backlog", "Pendente", "Em Progresso", "Revisão", "Concluida"];
  const statusData = createSelectGroup("Status", "statusID", statusOptions);
  const statusValue = taskToEdit?.status_id ?? null;
  if (statusValue && taskStatuses.length > 0) {
    const selectedStatus = taskStatuses.find(
      (status) => status.id === statusValue,
    );
    if (selectedStatus) {
      statusData.select.value = selectedStatus.name;
    }
  }

  const priorities = await PriorityService.getPriorities().catch(() => []);
  const priorityOptions =
    priorities.length > 0
      ? priorities.map((priority) => priority.name)
      : ["Baixa", "Médio", "Alta", "Critica"];
  const priorityData = createSelectGroup(
    "Prioridade",
    "priorityID",
    priorityOptions,
  );
  const priorityValue = taskToEdit?.priority_id ?? null;
  if (priorityValue && priorities.length > 0) {
    const selectedPriority = priorities.find(
      (priority) => priority.id === priorityValue,
    );
    if (selectedPriority) {
      priorityData.select.value = selectedPriority.name;
    }
  }

  const estimatedHoursData = createInputGroup(
    "Horas Estimadas",
    "taskEstimatedHoursInput",
    "number",
    "0.00",
  );
  (estimatedHoursData.input as HTMLInputElement).min = "0";
  (estimatedHoursData.input as HTMLInputElement).step = "0.25";
  const estimatedHoursValue =
    taskToEdit?.estimated_hours ?? taskToEdit?.getEstimatedHours?.() ?? "";
  if (estimatedHoursValue !== undefined && estimatedHoursValue !== null) {
    (estimatedHoursData.input as HTMLInputElement).value =
      String(estimatedHoursValue);
  }

  const submitBtn = createButton(
    "button",
    taskToEdit ? "Atualizar" : "Adicionar",
    "submit",
  ) as HTMLButtonElement;

  // Criar containers para campos lado a lado
  const categoryTypeRow = document.createElement("div");
  categoryTypeRow.className = "form-fields-row";
  categoryTypeRow.append(categoryData.section, TypeData.section);

  const statusPriorityRow = document.createElement("div");
  statusPriorityRow.className = "form-fields-row";
  statusPriorityRow.append(statusData.section, priorityData.section);

  form.append(
    titleData.section,
    descriptionGroup,
    categoryTypeRow,
    statusPriorityRow,
    estimatedHoursData.section,
    submitBtn,
  );
  content.append(closeBtn, titleHeading, form);
  modal.append(content);
  document.body.appendChild(modal);

  // Ligar a lógica ao formulário
  setupTaskFormLogic(
    form,
    {
      title: titleData.input,
      description: descriptionTextarea,
      category: categoryData.select,
      type: TypeData.select,
      status: statusData.select,
      priority: priorityData.select,
      estimatedHours: estimatedHoursData.input,
    },
    {
      titleErr: titleData.errorSection,
      descriptionErr: descriptionError,
      categoryErr: categoryData.errorSection,
      typeErr: TypeData.errorSection,
      statusErr: statusData.errorSection,
      priorityErr: priorityData.errorSection,
      estimatedHoursErr: estimatedHoursData.errorSection,
    },
    modal,
    projectId,
    taskToEdit,
    user,
    onSuccess,
  );

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}
