var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProjectService, TaskService, UserService, TeamService, TeamMemberService, SprintService, SprintTaskService, } from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { activateMenu } from "../dom/index.js";
import { loadProjectsPage } from "./index.js";
import { formatDate, generateTeamColors, DEFAULT_COLORS, } from "../../api/utils/index.js";
export function renderProjectGantt(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapper = document.createElement("div");
        wrapper.className = "gantt-wrapper";
        const backBtn = document.createElement("button");
        backBtn.className = "back-btn";
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
        backBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const projects = yield ProjectService.getProjects();
            activateMenu("#menuProjects");
            yield loadProjectsPage(projects);
        }));
        wrapper.appendChild(backBtn);
        const topContainer = document.createElement("div");
        topContainer.className = "gantt-top";
        topContainer.appendChild(yield createHeader(projectId));
        wrapper.appendChild(topContainer);
        wrapper.appendChild(createTimeline(6));
        try {
            const tasks = yield TaskService.getTasksByProject(projectId);
            const sprints = yield SprintService.getSprints();
            const sprintTaskRelations = yield SprintTaskService.getSprintTasks();
            const users = yield UserService.getUsers();
            let teams = [];
            let teamMembers = [];
            try {
                teams = yield TeamService.getTeams();
                // Agora os team members são aninhados por team
                for (const team of teams) {
                    const members = yield TeamMemberService.getTeamMembers(team.id);
                    teamMembers.push(...members);
                }
            }
            catch (dataError) {
                console.warn(`⚠️ Aviso ao carregar times e membros:`, dataError);
            }
            const assigneeUserIds = new Set();
            tasks.forEach((task) => {
                var _a;
                const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
                assignees.forEach((assignee) => {
                    assigneeUserIds.add(assignee.user_id);
                });
            });
            const teamMemberIds = new Set(teamMembers.map((member) => member.user_id));
            const filteredTeams = teams.filter((team) => {
                return teamMembers.some((member) => member.team_id === team.id && assigneeUserIds.has(member.user_id));
            });
            const ganttColors = generateTeamColors(filteredTeams);
            if (ganttColors.length > 0) {
                topContainer.appendChild(createLegend(ganttColors));
            }
            const userMap = new Map();
            users.forEach((user) => {
                userMap.set(user.getId(), user.getName());
            });
            const projectSprints = sprints.filter((sprint) => sprint.project_id === projectId || sprint.projectId === projectId);
            const tasksBySprint = projectSprints.map((sprint) => ({
                sprint,
                tasks: tasks.filter((task) => sprintTaskRelations.some((relation) => {
                    var _a, _b;
                    return relation.sprint_id === sprint.id &&
                        ((_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id) === relation.task_id;
                })),
            }));
            const unassignedTasks = tasks.filter((task) => !sprintTaskRelations.some((relation) => { var _a, _b; return ((_b = (_a = task.getId) === null || _a === void 0 ? void 0 : _a.call(task)) !== null && _b !== void 0 ? _b : task.id) === relation.task_id; }));
            const ganttTasks = transformSprintsToGantt(tasksBySprint, unassignedTasks, 6, userMap, ganttColors, teamMemberIds);
            wrapper.appendChild(createTasks(ganttTasks, 6));
        }
        catch (error) {
            const errorMsg = document.createElement("p");
            errorMsg.textContent = `Erro ao carregar tarefas: ${error instanceof Error ? error.message : String(error)}`;
            errorMsg;
            errorMsg;
            wrapper.appendChild(errorMsg);
        }
        return wrapper;
    });
}
function getGanttAssigneeLabel(assignees, userMap, teamMemberIds) {
    if (assignees.length === 0) {
        return "Sem atribuição";
    }
    const teamAssignees = assignees.filter((assignee) => teamMemberIds.has(assignee.user_id));
    const chosenAssignees = teamAssignees.length > 0 ? teamAssignees : assignees;
    return chosenAssignees
        .map((assignee) => userMap.get(assignee.user_id) || `User ${assignee.user_id}`)
        .join(", ");
}
function transformSprintsToGantt(sprintsWithTasks, unassignedTasks, weeks, userMap, ganttColors, teamMemberIds) {
    const colors = ganttColors.length > 0 ? ganttColors.map((c) => c.color) : DEFAULT_COLORS;
    const sprintRows = sprintsWithTasks
        .filter((group) => group.tasks.length > 0)
        .map((group, groupIndex) => ({
        name: group.sprint.name || `Sprint ${group.sprint.id}`,
        activities: group.tasks.map((task, taskIndex) => {
            var _a, _b, _c;
            const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
            const assigneeLabel = getGanttAssigneeLabel(assignees, userMap, teamMemberIds);
            return {
                label: task.title || `Tarefa ${(_c = (_b = task.getId) === null || _b === void 0 ? void 0 : _b.call(task)) !== null && _c !== void 0 ? _c : task.id}`,
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
            activities: unassignedTasks.map((task, taskIndex) => {
                var _a, _b, _c;
                const assignees = ((_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)) || [];
                const assigneeLabel = getGanttAssigneeLabel(assignees, userMap, teamMemberIds);
                return {
                    label: task.title || `Tarefa ${(_c = (_b = task.getId) === null || _b === void 0 ? void 0 : _b.call(task)) !== null && _c !== void 0 ? _c : task.id}`,
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
function createHeader(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const header = document.createElement("div");
        header.className = "gantt-header";
        try {
            const project = yield ProjectService.getProjectById(projectId);
            if (project) {
                const name = project.getName() || "Sem Título";
                const startDate = formatDate(project.getStartDate());
                const endDate = formatDate(project.getEndDateExpected());
                header.innerHTML = `<h1>${name}</h1><p>De ${startDate} até ${endDate}</p>`;
            }
            else {
                header.innerHTML = `<h1>Projeto ${projectId} não encontrado</h1>`;
            }
        }
        catch (error) {
            console.error("Erro ao carregar o header:", error);
            header.innerHTML = `<h1>Erro ao carregar o projeto</h1>`;
            showInfoBanner("Erro ao carregar informações do projeto", "error-banner");
        }
        return header;
    });
}
function createLegend(ganttColors) {
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
function createTimeline(weeks) {
    const timeline = document.createElement("div");
    timeline.className = "timeline";
    timeline;
    for (let i = 1; i <= weeks; i++) {
        const week = document.createElement("div");
        week.className = "week";
        week.textContent = `WEEK ${i}`;
        timeline.appendChild(week);
    }
    return timeline;
}
function createTasks(tasks, weeks) {
    const container = document.createElement("div");
    tasks.forEach((task) => {
        container.appendChild(createTaskGroup(task, weeks));
    });
    return container;
}
function createTaskGroup(task, weeks) {
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
function createActivity(act, weeks) {
    const row = document.createElement("div");
    row.className = "activity-row";
    const label = document.createElement("div");
    label.className = "activity-label";
    label.textContent = act.label;
    const barContainer = document.createElement("div");
    barContainer.className = "bar-container";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar;
    bar;
    bar.textContent = act.name;
    barContainer.appendChild(bar);
    row.appendChild(label);
    row.appendChild(barContainer);
    return row;
}
