import {
  ProjectService,
  TaskService,
  UserService,
  TeamService,
  TeamMemberService,
  SprintService,
  SprintTaskService,
} from "../../services/index.js";
import { IUser } from "../../models/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { activateMenu } from "../dom/index.js";
import { loadProjectsPage } from "./index.js";
import {
  ActivityBar,
  formatDate,
  GanttTask,
  generateTeamColors,
  LegendItem,
  DEFAULT_COLORS,
} from "../../api/utils/index.js";

export async function renderProjectGantt(
  projectId: number,
): Promise<HTMLElement> {
  const wrapper = document.createElement("div");
  wrapper.className = "gantt-wrapper";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
  backBtn.addEventListener("click", async () => {
    const projects = await ProjectService.getProjects();
    activateMenu("#menuProjects");
    await loadProjectsPage(projects);
  });
  wrapper.appendChild(backBtn);

  const topContainer = document.createElement("div");
  topContainer.className = "gantt-top";
  topContainer.appendChild(await createHeader(projectId));

  wrapper.appendChild(topContainer);
  wrapper.appendChild(createTimeline(6));

  try {
    const tasks = await TaskService.getTasksByProject(projectId);
    const sprints = await SprintService.getSprints();
    const sprintTaskRelations = await SprintTaskService.getSprintTasks();
    const users = await UserService.getUsers();

    let teams: any[] = [];
    let teamMembers: any[] = [];

    try {
      teams = await TeamService.getTeams();
      // Agora os team members são aninhados por team
      for (const team of teams) {
        const members = await TeamMemberService.getTeamMembers(team.id);
        teamMembers.push(...members);
      }
    } catch (dataError) {
      console.warn(`⚠️ Aviso ao carregar times e membros:`, dataError);
    }

    const assigneeUserIds = new Set<number>();
    tasks.forEach((task: any) => {
      const assignees = task.getAssignees?.() || [];
      assignees.forEach((assignee: any) => {
        assigneeUserIds.add(assignee.user_id);
      });
    });

    const teamMemberIds = new Set<number>(teamMembers.map((member: any) => member.user_id));

    const filteredTeams = teams.filter((team: any) => {
      return teamMembers.some(
        (member: any) =>
          member.team_id === team.id && assigneeUserIds.has(member.user_id),
      );
    });

    const ganttColors = generateTeamColors(filteredTeams);

    if (ganttColors.length > 0) {
      topContainer.appendChild(createLegend(ganttColors));
    }

    const userMap = new Map<number, string>();
    users.forEach((user: IUser) => {
      userMap.set(user.getId(), user.getName());
    });

    const projectSprints = sprints.filter(
      (sprint: any) => sprint.project_id === projectId || sprint.projectId === projectId,
    );

    const tasksBySprint = projectSprints.map((sprint: any) => ({
      sprint,
      tasks: tasks.filter((task: any) =>
        sprintTaskRelations.some(
          (relation: any) =>
            relation.sprint_id === sprint.id &&
            (task.getId?.() ?? task.id) === relation.task_id,
        ),
      ),
    }));

    const unassignedTasks = tasks.filter(
      (task: any) =>
        !sprintTaskRelations.some(
          (relation: any) => (task.getId?.() ?? task.id) === relation.task_id,
        ),
    );

    const ganttTasks = transformSprintsToGantt(
      tasksBySprint,
      unassignedTasks,
      6,
      userMap,
      ganttColors,
      teamMemberIds,
    );
    wrapper.appendChild(createTasks(ganttTasks, 6));
  } catch (error) {
    const errorMsg = document.createElement("p");
    errorMsg.textContent = `Erro ao carregar tarefas: ${error instanceof Error ? error.message : String(error)}`;
    errorMsg
    errorMsg
    wrapper.appendChild(errorMsg);
  }

  return wrapper;
}

function getGanttAssigneeLabel(
  assignees: any[],
  userMap: Map<number, string>,
  teamMemberIds: Set<number>,
): string {
  if (assignees.length === 0) {
    return "Sem atribuição";
  }

  const teamAssignees = assignees.filter((assignee: any) =>
    teamMemberIds.has(assignee.user_id),
  );

  const chosenAssignees = teamAssignees.length > 0 ? teamAssignees : assignees;

  return chosenAssignees
    .map((assignee: any) =>
      userMap.get(assignee.user_id) || `User ${assignee.user_id}`,
    )
    .join(", ");
}

function transformSprintsToGantt(
  sprintsWithTasks: Array<{ sprint: any; tasks: any[] }>,
  unassignedTasks: any[],
  weeks: number,
  userMap: Map<number, string>,
  ganttColors: LegendItem[],
  teamMemberIds: Set<number>,
): GanttTask[] {
  const colors =
    ganttColors.length > 0 ? ganttColors.map((c) => c.color) : DEFAULT_COLORS;

  const sprintRows = sprintsWithTasks
    .filter((group) => group.tasks.length > 0)
    .map((group: any, groupIndex: number) => ({
      name: group.sprint.name || `Sprint ${group.sprint.id}`,
      activities: group.tasks.map((task: any, taskIndex: number) => {
        const assignees = task.getAssignees?.() || [];
        const assigneeLabel = getGanttAssigneeLabel(
          assignees,
          userMap,
          teamMemberIds,
        );

        return {
          label: task.title || `Tarefa ${task.getId?.() ?? task.id}`,
          name: assigneeLabel,
          start: taskIndex % weeks,
          duration: Math.min(2, weeks - (taskIndex % weeks)),
          color: colors[(groupIndex + taskIndex) % colors.length],
        };
      }),
    }));

  if (unassignedTasks.length > 0) {
    sprintRows.push({
      name: "Sem Sprint",
      activities: unassignedTasks.map((task: any, taskIndex: number) => {
        const assignees = task.getAssignees?.() || [];
        const assigneeLabel = getGanttAssigneeLabel(
          assignees,
          userMap,
          teamMemberIds,
        );

        return {
          label: task.title || `Tarefa ${task.getId?.() ?? task.id}`,
          name: assigneeLabel,
          start: taskIndex % weeks,
          duration: Math.min(2, weeks - (taskIndex % weeks)),
          color: colors[taskIndex % colors.length],
        };
      }),
    });
  }

  return sprintRows;
}

async function createHeader(projectId: number): Promise<HTMLElement> {
  const header = document.createElement("div");
  header.className = "gantt-header";

  try {
    const project = await ProjectService.getProjectById(projectId);

    if (project) {
      const name = project.getName() || "Sem Título";
      const startDate = formatDate(project.getStartDate());
      const endDate = formatDate(project.getEndDateExpected());

      header.innerHTML = `<h1>${name}</h1><p>De ${startDate} até ${endDate}</p>`;
    } else {
      header.innerHTML = `<h1>Projeto ${projectId} não encontrado</h1>`;
    }
  } catch (error) {
    console.error("Erro ao carregar o header:", error);
    header.innerHTML = `<h1>Erro ao carregar o projeto</h1>`;
    showInfoBanner("Erro ao carregar informações do projeto", "error-banner");
  }

  return header;
}

function createLegend(ganttColors: LegendItem[]): HTMLElement {
  const legend = document.createElement("div");
  legend.className = "legend";

  ganttColors.forEach((item) => {
    const row = document.createElement("div");
    row.className = "legend-item";
    row.innerHTML = `
      <span>${item.name}</span>
      <div></div>
    `;
    legend.appendChild(row);
  });

  return legend;
}

function createTimeline(weeks: number): HTMLElement {
  const timeline = document.createElement("div");
  timeline.className = "timeline";
  timeline

  for (let i = 1; i <= weeks; i++) {
    const week = document.createElement("div");
    week.className = "week";
    week.textContent = `WEEK ${i}`;
    timeline.appendChild(week);
  }

  return timeline;
}

function createTasks(tasks: GanttTask[], weeks: number): HTMLElement {
  const container = document.createElement("div");

  tasks.forEach((task) => {
    container.appendChild(createTaskGroup(task, weeks));
  });

  return container;
}

function createTaskGroup(task: GanttTask, weeks: number): HTMLElement {
  const group = document.createElement("div");

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.name;

  group.appendChild(title);

  task.activities.forEach((act) => {
    group.appendChild(createActivity(act, weeks));
  });

  return group;
}

function createActivity(act: ActivityBar, weeks: number): HTMLElement {
  const row = document.createElement("div");
  row.className = "activity-row";

  const label = document.createElement("div");
  label.className = "activity-label";
  label.textContent = act.label;

  const barContainer = document.createElement("div");
  barContainer.className = "bar-container";

  const bar = document.createElement("div");
  bar.className = "bar";
  bar
  bar
  bar.textContent = act.name;

  barContainer.appendChild(bar);
  row.appendChild(label);
  row.appendChild(barContainer);

  return row;
}
