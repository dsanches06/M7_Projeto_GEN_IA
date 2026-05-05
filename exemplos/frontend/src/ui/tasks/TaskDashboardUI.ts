import { ITask } from "../../tasks/index.js";
import { IProject } from "../../projects/index.js";
import { IUser } from "../../models/index.js";
import { createTaskCard } from "./index.js";
import {
  ProjectService,
  TaskService,
  UserService,
} from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";

export class TaskDashboardUI {
  private container: HTMLElement;
  private projects: IProject[] = [];
  private tasksByProject: Map<number, ITask[]> = new Map();
  private userMap: Map<number, IUser> = new Map();

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "taskDashboardContainer";
    this.container.className = "task-dashboard-container";
  }

  /**
   * Carrega dados da API e renderiza
   */
  public async loadAndRender(): Promise<HTMLElement> {
    try {
      await this.loadProjectsAndTasks();
      await this.render();
    } catch (error) {
      console.error("Erro ao inicializar dashboard de tarefas:", error);
      showInfoBanner("Erro ao carregar dashboard de tarefas", "error-banner");
      console.error("Erro ao carregar dados:", error);
      this.container.innerHTML = `
        <div class="empty-state">
          <p>Erro ao carregar tarefas</p>
        </div>
      `;
    }
    return this.container;
  }

  /**
   * Carrega projetos e tarefas da API
   */
  private async loadProjectsAndTasks(): Promise<void> {
    try {
      // Carregar todos os usuários uma única vez
      const allUsers = await UserService.getUsers();
      this.userMap.clear();
      allUsers.forEach((user: IUser) => {
        this.userMap.set(user.getId(), user);
      });

      // Buscar todos os projetos
      const projectsData = await ProjectService.getProjects();
      this.projects = projectsData;

      // Para cada projeto, buscar suas tarefas
      for (const project of this.projects) {
        try {
          const tasks = await TaskService.getTasksByProject(project.getId());
          this.tasksByProject.set(project.getId(), tasks);
        } catch (error) {
          console.warn(
            `Erro ao buscar tarefas do projeto ${project.getId()}:`,
            error,
          );
          showInfoBanner("Erro ao buscar tarefas do projeto", "warning-banner");
          this.tasksByProject.set(project.getId(), []);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      showInfoBanner("Erro ao buscar tarefas do projeto", "warning-banner");
      this.projects = [];
    }
  }

  /**
   * Renderiza as tarefas em um container com cards agrupadas por projeto
   */
  private async render(): Promise<void> {
    this.container.innerHTML = "";

    if (this.projects.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.innerHTML = "<p>Nenhum projeto encontrado</p>";
      this.container.appendChild(emptyState);
      return;
    }

    // Renderizar cada projeto com suas tarefas
    for (const project of this.projects) {
      const tasks = this.tasksByProject.get(project.getId()) || [];
      const projectSection = await this.createProjectSection(project, tasks);
      this.container.appendChild(projectSection);
    }
  }

  /**
   * Cria uma seção de projeto com suas tarefas
   */
  private async createProjectSection(
    project: IProject,
    tasks: ITask[],
  ): Promise<HTMLElement> {
    const section = document.createElement("div");
    section.className = "project-task-section";

    // Cabeçalho do projeto
    const header = document.createElement("div");
    header.className = "project-task-header";

    const title = document.createElement("h2");
    title.textContent = project.getName();

    const taskCount = document.createElement("span");
    taskCount.textContent = `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`;

    header.appendChild(title);
    header.appendChild(taskCount);

    // Wrapper dos cards
    const tasksWrapper = document.createElement("div");
    tasksWrapper.className = "tasks-cards-wrapper";

    if (tasks.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "empty-project-state";
      emptyMsg.textContent = "Nenhuma tarefa neste projeto";
      tasksWrapper.appendChild(emptyMsg);
    } else {
      // Renderizar cards das tarefas
      for (const task of tasks) {
        const taskCard = await createTaskCard(task, this.userMap);
        tasksWrapper.appendChild(taskCard);
      }
    }

    section.appendChild(header);
    section.appendChild(tasksWrapper);

    return section;
  }
}

/**
 * Renderiza tarefas filtradas agrupadas por projeto em um container existente
 */
export async function renderFilteredTasks(
  filteredTasks: ITask[],
): Promise<void> {
  const container = document.querySelector("#taskDashboardContainer") as HTMLElement;
  if (!container) {
    console.warn("Container #taskDashboardContainer não encontrado");
    return;
  }

  container.innerHTML = "";

  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma tarefa encontrada</p>
      </div>
    `;
    return;
  }

  try {
    // Carregar todos os usuários
    const allUsers = await UserService.getUsers();
    const userMap = new Map<number, IUser>();
    allUsers.forEach((user: IUser) => {
      userMap.set(user.getId(), user);
    });

    // Agrupar tarefas por projeto
    const projectMap = new Map<number, ITask[]>();
    for (const task of filteredTasks) {
      const projectId = task.getProject?.()?.getId?.() ?? 0;
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, []);
      }
      projectMap.get(projectId)!.push(task);
    }

    // Buscar informações dos projetos
    const projects = await ProjectService.getProjects();

    // Renderizar cada projeto com suas tarefas
    for (const project of projects) {
      const projectTasks = projectMap.get(project.getId()) || [];
      if (projectTasks.length === 0) continue;

      const projectSection = document.createElement("div");
      projectSection.className = "project-task-section";

      const header = document.createElement("div");
      header.className = "project-task-header";
      header.innerHTML = `<h2>${project.getName()}</h2><div class="project-separator"></div>`;

      const tasksWrapper = document.createElement("div");
      tasksWrapper.className = "tasks-cards-wrapper";

      for (const task of projectTasks) {
        const taskCard = await createTaskCard(task, userMap);
        tasksWrapper.appendChild(taskCard);
      }

      projectSection.appendChild(header);
      projectSection.appendChild(tasksWrapper);
      container.appendChild(projectSection);
    }
  } catch (error) {
    console.error("Erro ao renderizar tarefas filtradas:", error);
    showInfoBanner("Erro ao filtrar tarefas", "error-banner");
  }
}
