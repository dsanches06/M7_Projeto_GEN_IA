import { IProject, Project } from "../../projects/index.js";
import { addElementInContainer, clearContainer } from "../dom/index.js";
import { renderProjectDashboard, renderProjectGantt } from "./index.js";
import { loadProjectsPage } from "./ProjectPageUI.js";
import { renderProjectModal } from "../modal/index.js";
import {
  ProjectService,
  UserService,
  TaskService,
  TimeLogService,
  SprintService,
} from "../../services/index.js";
import { getAvatarPath, showConfirmDialog, showInfoBanner } from "../../helpers/index.js";
import { IUser } from "../../models/index.js";
import { ITask } from "../../tasks/index.js";

/* Renderiza os projetos em cards na Grid principal */
export async function renderProjectsCards(projects: IProject[]): Promise<void> {
  let gridContainer = document.querySelector(
    "#projectsGridContainer",
  ) as HTMLElement;

  if (!gridContainer) {
    gridContainer = document.createElement("div");
    gridContainer.id = "projectsGridContainer";
    gridContainer.className = "projects-grid-container";
    addElementInContainer("#containerSection", gridContainer);
  }

  gridContainer.innerHTML = "";

  for (const p of projects) {
    const card = await createProjectCard(p as Project);
    card.classList.add("grid-card-container");

    card.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearContainer("#containerSection");
      const ganttElement = await renderProjectDashboard(p.getId());
      addElementInContainer("#containerSection", ganttElement);
    });

    gridContainer.appendChild(card);
  }
}

/* Cria a estrutura individual de cada card de projeto */
async function createProjectCard(project: Project): Promise<HTMLElement> {
  const card = document.createElement("div");
  card.className = "project-card";
  card.style.display = "flex";
  card.style.gap = "1rem";
  card.style.alignItems = "flex-start";

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "project-card-content";
  contentWrapper.style.flex = "1";

  // HEADER (Título e Botões de Opções se existirem)
  const header = document.createElement("div");
  header.className = "card-header";
  header.style.padding = "1rem";
  header.style.borderBottom = "1px solid #ddd";

  const title = document.createElement("h3");
  title.textContent = project.getName();

  const actionButtons = document.createElement("div");
  actionButtons.style.display = "flex";
  actionButtons.style.flexDirection = "column";
  actionButtons.style.gap = "0.5rem";
  actionButtons.style.alignItems = "flex-end";
  actionButtons.style.flexShrink = "0";

  const ganttBtn = document.createElement("button");
  ganttBtn.className = "icon-button";
  ganttBtn.innerHTML = `<i class="fa-solid fa-chart-gantt"></i>`;
  ganttBtn.title = "Ver Gantt";
  ganttBtn.setAttribute("aria-label", "Ver Gantt");
  ganttBtn.style.padding = "0.5rem";
  ganttBtn.style.cursor = "pointer";
  ganttBtn.style.border = "none";
  ganttBtn.style.background = "transparent";
  ganttBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    // Limpar a seção principal e criar uma nova página para o Gantt
    clearContainer("#containerSection");
    const ganttPage = document.createElement("div");
    ganttPage.className = "gantt-page";
    // Título
    const ganttTitle = document.createElement("h2");
    ganttTitle.textContent = `Gráfico de Gantt do Projeto: ${project.getName()}`;
    ganttTitle.style.marginBottom = "1rem";
    ganttPage.appendChild(ganttTitle);
    // Gantt chart
    const gantt = await renderProjectGantt(project.getId());
    ganttPage.appendChild(gantt);
    addElementInContainer("#containerSection", ganttPage);
  });

  const editBtn = document.createElement("button");
  editBtn.className = "icon-button";
  editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
  editBtn.title = "Editar projeto";
  editBtn.setAttribute("aria-label", "Editar projeto");
  editBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleProjectEdit(project);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-button";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.title = "Apagar projeto";
  deleteBtn.setAttribute("aria-label", "Apagar projeto");
  deleteBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (!await showConfirmDialog(`Tem a certeza que deseja apagar o projeto "${project.getName()}"?`)) {
      return;
    }
    try {
      await ProjectService.deleteProject(project.getId());
      showInfoBanner(`Projeto "${project.getName()}" apagado com sucesso.`, "success-banner");
      const currentProjects = await ProjectService.getProjects();
      await loadProjectsPage(currentProjects);
    } catch (error) {
      showInfoBanner(`Erro ao excluir projeto: ${error}`, "error-banner");
    }
  });

  actionButtons.appendChild(ganttBtn);
  actionButtons.appendChild(editBtn);
  actionButtons.appendChild(deleteBtn);
  header.appendChild(title);

  // STATUS (Badge)
  const status = document.createElement("span");
  status.className = `project-status status-${project.getStatus().toLowerCase()}`;
  status.textContent = project.getStatus();

  // DESCRIPTION
  const desc = document.createElement("p");
  desc.className = "project-desc";
  desc.textContent = project.getDescription() || "No description";

  // DATES (Container Flex)
  const datesContainer = document.createElement("div");
  datesContainer.className = "project-dates";

  const startDate = document.createElement("span");
  startDate.className = "start-date";
  startDate.textContent = `Início: ${new Date(project.getStartDate()).toLocaleDateString("pt-BR")}`;

  const endDate = document.createElement("span");
  endDate.className = "end-date";
  endDate.textContent = `Fim: ${new Date(project.getEndDateExpected()).toLocaleDateString("pt-BR")}`;

  datesContainer.appendChild(startDate);
  datesContainer.appendChild(endDate);

  const footer = document.createElement("div");
  footer.className = "project-card-footer";

  const avatarStack = document.createElement("div");
  avatarStack.className = "avatar-stack";

  let tasks: ITask[] = [];

  try {
    // Carregar tasks do projeto
    tasks = await TaskService.getTasksByProject(project.getId());

    // Extrair todos os user_ids únicos dos assignees
    const userIdsSet = new Set<number>();
    tasks.forEach((task: ITask) => {
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
    console.error("Erro ao carregar membros do projeto:", error);
  }

  footer.appendChild(avatarStack);

  // SPRINT INFO
  const sprintInfo = document.createElement("div");
  sprintInfo.style.display = "flex";
  sprintInfo.style.gap = "0.5rem";
  sprintInfo.style.alignItems = "center";

  try {
    // Carregar sprints e filtrar por projeto
    const allSprints = await SprintService.getSprints();
    const projectSprints = allSprints.filter(
      (sprint: any) => sprint.project_id === project.getId()
    );

    const sprintCount = projectSprints.length;
    const sprintIcon = document.createElement("i");
    sprintIcon.className = "fa-solid fa-list-check";
    sprintIcon.style.fontSize = "1rem";

    const sprintText = document.createElement("span");
    sprintText.style.fontSize = "0.95rem";
    sprintText.style.fontWeight = "500";
    sprintText.style.color = "#555";
    sprintText.textContent = `${sprintCount} Sprint${sprintCount !== 1 ? "s" : ""}`;

    sprintInfo.appendChild(sprintIcon);
    sprintInfo.appendChild(sprintText);
  } catch (error) {
    console.error("Erro ao carregar sprints do projeto:", error);
  }

  footer.appendChild(sprintInfo);

  // PROGRESS BAR
  const progressWrapper = document.createElement("div");
  progressWrapper.className = "project-progress-wrapper";

  const progressBar = document.createElement("div");
  progressBar.className = "project-progress-bar";

  // Calcular progresso baseado nas horas de time logs
  const progressValue = await calculateProgressFromTimeLogs(project, tasks);

  const progressFill = document.createElement("div");
  progressFill.className = "project-progress-fill";
  progressFill.style.width = `${progressValue}%`;

  progressBar.appendChild(progressFill);
  progressWrapper.appendChild(progressBar);

  // Adicionar ao card na ordem correta
  contentWrapper.appendChild(header);
  contentWrapper.appendChild(status);
  contentWrapper.appendChild(desc);
  contentWrapper.appendChild(datesContainer);
  contentWrapper.appendChild(progressWrapper);
  contentWrapper.appendChild(footer);
  card.append(contentWrapper, actionButtons);

  return card;
}

/* Calcula o progresso do projeto baseado nas horas de time logs */
async function handleProjectEdit(project: Project): Promise<void> {
  try {
    await renderProjectModal({
      id: project.getId(),
      name: project.getName(),
      description: project.getDescription(),
      start_date: project.getStartDate(),
      end_date_expected: project.getEndDateExpected(),
    });
  } catch (error) {
    showInfoBanner("Erro ao abrir formulário de edição.", "error-banner");
    console.error(error);
  }
}

async function calculateProgressFromTimeLogs(
  project: Project,
  tasks: any[],
): Promise<number> {
  try {
    // Obter todos os time logs
    const allTimeLogs = await TimeLogService.getTimeLogs();

    // Filtrar time logs para as tasks do projeto
    const taskIds = tasks.map((t: any) => t.getId?.() || t.id);
    const projectTimeLogs = allTimeLogs.filter((log: any) =>
      taskIds.includes(log.task_id),
    );

    // Calcular total de horas registadas
    const totalHours = projectTimeLogs.reduce((sum: number, log: any) => {
      return sum + (log.hours || 0);
    }, 0);

    // Calcular total de horas estimadas das tasks
    const totalEstimatedHours = tasks.reduce((sum: number, task: any) => {
      const estimated = task.getEstimatedHours?.() || task.estimated_hours || 0;
      return sum + estimated;
    }, 0);

    // Calcular progress percentage
    if (totalEstimatedHours > 0) {
      const progress = Math.min((totalHours / totalEstimatedHours) * 100, 100);
      return Math.round(progress);
    }

    // Se não há horas estimadas, usar um limite padrão de 8 horas por task
    const defaultEstimatedHours = tasks.length * 8;
    if (defaultEstimatedHours > 0) {
      const progress = Math.min(
        (totalHours / defaultEstimatedHours) * 100,
        100,
      );
      return Math.round(progress);
    }

    return 0;
  } catch (error) {
    console.error("Erro ao calcular progresso do projeto:", error);
    return 0;
  }
}
