import {
  TaskService,
  UserService,
  SprintService,
  SprintTaskService,
  ProjectStatusService,
} from "../../services/index.js";
import { IUser } from "../../models/index.js";
import { renderSprintModal } from "../modal/index.js";
import {
  getAvatarPath,
  showConfirmDialog,
  showInfoBanner,
} from "../../helpers/index.js";
import { SprintDTORequest } from "../../api/dto/typesDTO.js";
import { loadSprintsPage } from "./SprintsPageUI.js";

/* Renderiza os sprints em cards na Grid principal */
export async function renderSprintsCards(
  sprints: SprintDTORequest[],
): Promise<HTMLElement> {
  const gridContainer = document.createElement("div");
  gridContainer.id = "sprintsGridContainer";
  gridContainer.classList.add("grid-card-container");

  for (const sprint of sprints) {
    const card = await createSprintCard(sprint);
    gridContainer.appendChild(card);
  }
  return gridContainer;
}

/* Cria a estrutura individual de cada card de sprint */
async function createSprintCard(
  sprint: SprintDTORequest,
): Promise<HTMLElement> {
  const card = document.createElement("div");
  card.className = "sprint-card";

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "sprint-card-content";

  // HEADER (Título)
  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h3");
  title.textContent = sprint.name || "Sprint sem nome";

  const actions = document.createElement("div");
  actions.className = "sprint-card-actions";
  actions.style.display = "flex";
  actions.style.flexDirection = "column";
  actions.style.gap = "0.5rem";
  actions.style.alignItems = "flex-end";

  const allTasks = await TaskService.getTasks();
  const sprintTaskRelations = await SprintTaskService.getSprintTasks();
  const sprintRelations = sprintTaskRelations.filter(
    (relation: any) => relation.sprint_id === sprint.id,
  );

  const linkedTaskIds = new Set(
    sprintRelations.map((relation: any) => relation.task_id),
  );

  const projectId = sprint.project_id;
  const availableTasks = allTasks.filter((task: any) => {
    const taskId = task.getId?.() ?? task.id;
    const taskProjectId = task.projectId || task.project_id || task.project?.id;
    const belongsToProject = projectId ? taskProjectId === projectId : true;
    return belongsToProject && !linkedTaskIds.has(taskId);
  });

  const editBtn = document.createElement("button");
  editBtn.className = "icon-button";
  editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
  editBtn.title = "Editar sprint";
  editBtn.setAttribute("aria-label", "Editar sprint");
  editBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!projectId) {
      showInfoBanner(
        "Projeto não encontrado para este sprint.",
        "error-banner",
      );
      return;
    }
    await renderSprintModal(projectId, sprint);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-button";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.title = "Excluir sprint";
  deleteBtn.setAttribute("aria-label", "Excluir sprint");
  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (
      await showConfirmDialog(
        `Tem certeza que deseja excluir o sprint "${sprint.name}"?`,
      )
    ) {
      try {
        await SprintService.deleteSprint(sprint.id);
        showInfoBanner(
          `Sprint "${sprint.name}" removido com sucesso.`,
          "success-banner",
        );

        // Verificar se estamos no dashboard do projeto
        const dashboardElement = document.querySelector("#dashboardProject");
        if (dashboardElement) {
          // Estamos no dashboard do projeto, recarregar o dashboard inteiro
          const projectId = sprint.project_id;
          if (projectId) {
            const { renderProjectDashboard } =
              await import("../projects/ProjectDashboardUI.js");
            const projectDashboard = await renderProjectDashboard(projectId);
            dashboardElement.replaceWith(projectDashboard);
            return;
          }
        }

        // Caso contrário, recarregar a página geral de sprints
        const currentSprints = await SprintService.getSprints();
        await loadSprintsPage(currentSprints);
      } catch (error) {
        showInfoBanner(`Erro ao excluir sprint: ${error}`, "error-banner");
      }
    }
  });

  const linkSprintBtn = document.createElement("button");
  linkSprintBtn.className = "icon-button";
  linkSprintBtn.innerHTML = `<i class="fas fa-tasks"></i>
  <i class="fas fa-plus"></i>`;
  linkSprintBtn.title = "Associar tarefa ao sprint";
  linkSprintBtn.setAttribute("aria-label", "Associar tarefa ao sprint");
  linkSprintBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await handleSprintTaskLink(sprint);
  });
  linkSprintBtn.style.display = availableTasks.length > 0 ? "inline-flex" : "none";

  const unlinkSprintBtn = document.createElement("button");
  unlinkSprintBtn.className = "icon-button";
  unlinkSprintBtn.innerHTML = `<i class="fas fa-tasks"></i>
  <i class="fas fa-minus"></i>`;
  unlinkSprintBtn.title = "Desassociar tarefa do sprint";
  unlinkSprintBtn.setAttribute("aria-label", "Desassociar tarefa do sprint");
  unlinkSprintBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await handleSprintTaskUnlink(sprint);
  });
  unlinkSprintBtn.style.display = sprintRelations.length > 0 ? "inline-flex" : "none";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  actions.appendChild(linkSprintBtn);
  actions.appendChild(unlinkSprintBtn);
  header.appendChild(title);

  // STATUS (Badge)
  const status = document.createElement("span");
  let statusText = "Ativo";
  if (sprint.status_id) {
    const statusObj = await ProjectStatusService.getProjectStatusById(sprint.status_id);
    statusText = statusObj ? statusObj.name : `Status ${sprint.status_id}`;
  }
  status.className = `sprint-status status-${statusText.toLowerCase().replace(" ", "-")}`;
  status.textContent = statusText;

  // DESCRIPTION
  const desc = document.createElement("p");
  desc.className = "sprint-desc";
  desc.textContent = sprint.description || "Sem descrição disponível";

  // INFO (Container Flex)
  const infoContainer = document.createElement("div");
  infoContainer.className = "sprint-info";

  const startDate = document.createElement("span");
  startDate.className = "start-date";
  const startDateValue = sprint.start_date || new Date();
  startDate.textContent = `Início: ${new Date(startDateValue).toLocaleDateString("pt-BR")}`;

  const endDate = document.createElement("span");
  endDate.className = "end-date";
  const endDateValue = sprint.end_date || new Date();
  endDate.textContent = `Fim: ${new Date(endDateValue).toLocaleDateString("pt-BR")}`;

  const taskCount = document.createElement("span");
  taskCount.className = "task-count";
  taskCount.textContent = `Tarefas: 0`;

  infoContainer.appendChild(startDate);
  infoContainer.appendChild(endDate);
  infoContainer.appendChild(taskCount);

  const footer = document.createElement("div");
  footer.className = "sprint-card-footer";

  const avatarStack = document.createElement("div");
  avatarStack.className = "avatar-stack";

  try {
    // Carregar tasks do sprint através da relação sprint_tasks
    const allTasks = await TaskService.getTasks();
    const sprintTaskRelations = await SprintTaskService.getSprintTasks();
    const sprintTasks = allTasks.filter((task: any) =>
      sprintTaskRelations.some(
        (relation: any) =>
          relation.sprint_id === sprint.id &&
          (task.getId?.() ?? task.id) === relation.task_id,
      ),
    );

    // Atualizar contador de tarefas
    taskCount.textContent = `Tarefas: ${sprintTasks.length}`;

    // Extrair todos os user_ids únicos dos assignees
    const userIdsSet = new Set<number>();
    sprintTasks.forEach((task: any) => {
      const assignees = task.getAssignees?.() || [];
      assignees.forEach((assignee: any) => {
        if (assignee.user_id) {
          userIdsSet.add(assignee.user_id);
        }
      });
    });

    // Carregar todos os users para pegar gender
    const allUsers = await UserService.getUsers();
    const userMap = new Map<number, IUser>();
    allUsers.forEach((user: IUser) => {
      userMap.set(user.getId(), user);
    });

    // Construir array de membros com gender
    const members: Array<{ userId: number; gender: string; user: IUser }> = [];
    userIdsSet.forEach((userId) => {
      const user = userMap.get(userId);
      if (user) {
        members.push({
          userId,
          gender: (user as any).getGender?.() || "Male",
          user,
        });
      }
    });

    // Renderizar avatares (máximo 4)
    const displayLimit = 4;
    members.slice(0, displayLimit).forEach((member, index) => {
      const img = document.createElement("img");
      img.className = "avatar-img";

      // Selecionar pasta baseado no gender
      const randomValue = (index % 4) + 1; // 1-4
      img.src = getAvatarPath(member.userId, member.gender, randomValue);
      img.alt = member.user.getName();
      img.title = member.user.getName();

      avatarStack.appendChild(img);
    });

    // Mostrar "+X" se houver mais membros
    if (members.length > displayLimit) {
      const more = document.createElement("span");
      more.className = "avatar-more";
      more.textContent = `+${members.length - displayLimit}`;
      avatarStack.appendChild(more);
    }
  } catch (error) {
    showInfoBanner("Erro ao carregar membros do sprint", "error-banner");
    console.error("Erro ao carregar membros do sprint:", error);
  }

  footer.appendChild(avatarStack);

  // Adicionar ao card na ordem correta
  contentWrapper.appendChild(header);
  contentWrapper.appendChild(status);
  contentWrapper.appendChild(desc);
  contentWrapper.appendChild(infoContainer);
  contentWrapper.appendChild(footer);
  card.append(contentWrapper, actions);

  return card;
}

async function handleSprintTaskLink(sprint: any): Promise<void> {
  try {
    const projectId =
      sprint.projectId || sprint.project_id || sprint.project?.id;
    const allTasks = await TaskService.getTasks();
    const sprintTaskRelations = await SprintTaskService.getSprintTasks();

    const linkedTaskIds = new Set(
      sprintTaskRelations
        .filter((relation: any) => relation.sprint_id === sprint.id)
        .map((relation: any) => relation.task_id),
    );

    const availableTasks = allTasks.filter((task: any) => {
      const taskId = task.getId?.() ?? task.id;
      const taskProjectId =
        task.projectId || task.project_id || task.project?.id;
      const belongsToProject = projectId ? taskProjectId === projectId : true;
      return belongsToProject && !linkedTaskIds.has(taskId);
    });

    if (availableTasks.length === 0) {
      showInfoBanner(
        "Não há tarefas disponíveis sem vínculo ao sprint.",
        "warning-banner",
      );
      return;
    }

    await renderSprintTaskSelectionModal(sprint, availableTasks, "link");
  } catch (error) {
    console.error("Erro ao carregar tarefas para associar ao sprint:", error);
    showInfoBanner(
      "Erro ao carregar tarefas para associar ao sprint.",
      "error-banner",
    );
  }
}

async function handleSprintTaskUnlink(sprint: any): Promise<void> {
  try {
    const allTasks = await TaskService.getTasks();
    const sprintTaskRelations = await SprintTaskService.getSprintTasks();
    const sprintRelations = sprintTaskRelations.filter(
      (relation: any) => relation.sprint_id === sprint.id,
    );

    if (sprintRelations.length === 0) {
      showInfoBanner(
        "Este sprint não tem tarefas associadas.",
        "warning-banner",
      );
      return;
    }

    const associatedTasks = sprintRelations
      .map((relation: any) => ({
        relation,
        task: allTasks.find(
          (task: any) => (task.getId?.() ?? task.id) === relation.task_id,
        ),
      }))
      .filter((item: any) => item.task);

    if (associatedTasks.length === 0) {
      showInfoBanner(
        "Não foi possível encontrar tarefas associadas a este sprint.",
        "warning-banner",
      );
      return;
    }

    await renderSprintTaskSelectionModal(sprint, associatedTasks, "unlink");
  } catch (error) {
    console.error(
      "Erro ao carregar tarefas para desassociar do sprint:",
      error,
    );
    showInfoBanner(
      "Erro ao carregar tarefas para desassociar do sprint.",
      "error-banner",
    );
  }
}

function getTaskLabel(task: any): string {
  return (
    task.title ||
    task.name ||
    task.getTitle?.() ||
    task.getName?.() ||
    `Tarefa ${task.getId?.() ?? task.id}`
  );
}

async function renderSprintTaskSelectionModal(
  sprint: any,
  items: any[],
  mode: "link" | "unlink",
): Promise<void> {
  const modal = document.createElement("section");
  modal.className = "modal sprint-task-selection-modal";
  modal.id = `sprintTaskSelectionModal-${sprint.id}-${mode}`;

  const content = document.createElement("div");
  content.className = "modal-content";
  content.style.maxWidth = "600px";
  content.style.width = "100%";

  const title = document.createElement("h2");
  title.textContent =
    mode === "link"
      ? "Selecionar tarefa para associar ao sprint"
      : "Selecionar tarefa para desassociar do sprint";

  const list = document.createElement("div");
  list.className = "sprint-task-selection-list";
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "0.5rem";

  items.forEach((item: any) => {
    const task = mode === "unlink" ? item.task : item;
    const relation = item.relation;
    const row = document.createElement("div");
    row.className = "sprint-task-selection-row";
    row.style.display = "flex";
    row.style.gap = "0.5rem";
    row.style.alignItems = "center";
    row.style.padding = "0.5rem";
    row.style.borderBottom = "1px solid #e0e0e0";

    const label = document.createElement("span");
    label.textContent = getTaskLabel(task);
    label.style.flex = "1";
    label.style.fontSize = "0.95rem";

    const button = document.createElement("button");
    button.className = "btn primary";
    button.innerHTML =
      mode === "link"
        ? `<i class="fas fa-plus"></i>`
        : `<i class="fas fa-minus"></i>`;
    button.title = mode === "link" ? "Associar tarefa" : "Desassociar tarefa";
    button.setAttribute(
      "aria-label",
      mode === "link" ? "Associar tarefa" : "Desassociar tarefa",
    );
    button.style.whiteSpace = "nowrap";
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        if (mode === "link") {
          await SprintTaskService.createSprintTask(
            sprint.id,
            {
              sprint_id: sprint.id,
              task_id: task.getId?.() ?? task.id,
            }
          );
          showInfoBanner(
            `Tarefa "${getTaskLabel(task)}" associada ao sprint "${sprint.name}" com sucesso.`,
            "success-banner",
          );
        } else {
          await SprintTaskService.deleteSprintTask(relation.sprint_id, relation.task_id);
          showInfoBanner(
            `Tarefa "${getTaskLabel(task)}" desassociada do sprint "${sprint.name}" com sucesso.`,
            "success-banner",
          );
        }

        modal.remove();

        // Aguardar um pouco para garantir que o backend processou a mudança
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Verificar se estamos no dashboard do projeto
        const dashboardElement = document.querySelector("#dashboardProject");
        if (dashboardElement) {
          // Estamos no dashboard do projeto, recarregar apenas a seção de sprints
          const projectId = sprint.project_id;
          const sprintsSection =
            dashboardElement.querySelector(".sprints-section");
          if (sprintsSection && projectId) {
            // Recarregar apenas a seção de sprints do projeto
            const { createSprintsSection } =
              await import("../projects/index.js");
            const newSprintsSection = await createSprintsSection(projectId);
            sprintsSection.replaceWith(newSprintsSection);
            return;
          }
        }

        const currentSprints = await SprintService.getSprints();
        await loadSprintsPage(currentSprints);
      } catch (error) {
        console.error(error);
        showInfoBanner(
          "Erro ao atualizar a associação da tarefa.",
          "error-banner",
        );
      }
    });

    row.append(label, button);
    list.appendChild(row);
  });

  content.append(title, list);
  modal.appendChild(content);
  document.body.appendChild(modal);
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}
