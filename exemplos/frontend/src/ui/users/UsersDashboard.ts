import { ITask } from "../../tasks/index.js";
import { TaskStatus } from "../../tasks/TaskStatus.js";
import { IUser } from "../../models/index.js";
import { TaskService, TaskStatusService, SprintTaskService, SprintService } from "../../services/index.js";
import { loadUserTasksPage } from "../users/index.js";
import { getCardBorderColor, setCardBorderColor, showInfoBanner } from "../../helpers/index.js";
import { activateMenu } from "../dom/index.js";
import { styleTransparentButton } from "../dom/buttonStyles.js";

export class UsersDashboard {
  private container: HTMLElement;
  private tasks: ITask[] = [];
  private user: IUser;
  private statusMap: { [key: string]: number } = {};

  private readonly statusColumns = [
    { id: TaskStatus.CREATED, label: "CREATED" },
    { id: TaskStatus.ASSIGNED, label: "ASSIGNED" },
    { id: TaskStatus.BLOCKED, label: "BLOCKED" },
    { id: TaskStatus.IN_PROGRESS, label: "IN_PROGRESS" },
    { id: TaskStatus.COMPLETED, label: "COMPLETED" },
    { id: TaskStatus.ARCHIVED, label: "ARCHIVED" },
  ];

  constructor(user: IUser, tasks: ITask[] = []) {
    this.user = user;
    this.tasks = tasks;
    // Tenta reaproveitar o container existente ou cria um novo
    this.container = (document.querySelector("#dashBoardContainer") as HTMLElement) || 
                     document.createElement("div");
    this.container.id = "dashBoardContainer";
    const dashboardElement = document.createElement("div");
    this.loadStatusMap();
  }

  private async loadStatusMap(): Promise<void> {
    try {
      const statuses = await TaskStatusService.getTaskStatuses();
      statuses.forEach(status => {
        this.statusMap[status.name] = status.id;
      });
    } catch (error) {
      console.error("Erro ao carregar mapa de status:", error);
      showInfoBanner("Erro ao carregar status de tarefas", "error-banner");


      this.statusMap = {
        "CREATED": 1,
        "ASSIGNED": 2,
        "BLOCKED": 3,
        "IN_PROGRESS": 4,
        "COMPLETED": 5,
        "ARCHIVED": 6,
      };
    }
  }

  render(): HTMLElement {
    // 1. Cria a estrutura base das colunas (apenas uma vez)
    const backBtn = document.createElement("button");
    backBtn.className = "back-btn";
    backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
    backBtn.addEventListener("click", async () => {
      try {
        activateMenu("#menuUsers");
        await loadUserTasksPage(this.user.getId());
      } catch (error) {
        console.error("Erro ao voltar para página de tarefas:", error);
        showInfoBanner("Erro ao voltar para página de tarefas", "error-banner");
      }
    });

    const mainContainer = document.createElement("div");
    mainContainer.style.width = "100%";
    mainContainer.style.display = "flex";
    mainContainer.style.flexDirection = "column";

    const dashContainer = document.createElement("div");
    dashContainer.className = "dash-container";
    dashContainer.style.display = "flex";
    dashContainer.style.flexWrap = "wrap";
    dashContainer.style.justifyContent = "center";
    dashContainer.style.gap = "12px";
    dashContainer.style.width = "100%";

    this.statusColumns.forEach(col => {
      const column = document.createElement("div");
      column.className = "dash-column";
      column.style.flex = "1";
      column.style.minWidth = "200px";
      column.style.maxWidth = "300px";
      column.style.display = "flex";
      column.style.flexDirection = "column";

      const columnHeader = document.createElement("div");
      columnHeader.className = "column-header";
      columnHeader.style.display = "flex";
      columnHeader.style.justifyContent = "space-between";
      columnHeader.style.alignItems = "center";
      columnHeader.style.padding = "8px";
      columnHeader.style.backgroundColor = "#f8f9fa";
      columnHeader.style.borderBottom = "1px solid #dee2e6";

      const title = document.createElement("h2");
      title.textContent = col.label;
      title.style.margin = "0";
      title.style.fontSize = "1.1em";
      title.style.fontWeight = "bold";

      const count = document.createElement("span");
      count.className = "column-count";
      count.setAttribute("data-status", col.id.toString());
      count.textContent = "0";
      count.style.backgroundColor = "#007bff";
      count.style.color = "white";
      count.style.borderRadius = "50%";
      count.style.padding = "2px 8px";
      count.style.fontSize = "0.8em";
      count.style.fontWeight = "bold";

      columnHeader.appendChild(title);
      columnHeader.appendChild(count);

      const tasksContainer = document.createElement("div");
      tasksContainer.className = "tasks-container";
      tasksContainer.setAttribute("data-status", col.id.toString());
      tasksContainer.style.display = "flex";
      tasksContainer.style.flexDirection = "column";
      tasksContainer.style.gap = "8px";
      tasksContainer.style.padding = "8px";
      tasksContainer.style.minHeight = "200px";
      tasksContainer.style.overflowY = "auto";

      column.appendChild(columnHeader);
      column.appendChild(tasksContainer);
      dashContainer.appendChild(column);
    });

    mainContainer.appendChild(dashContainer);
    this.container.innerHTML = "";
    if (this.container.firstChild) {
      this.container.insertBefore(backBtn, this.container.firstChild);
    } else {
      this.container.appendChild(backBtn);
    }
    this.container.appendChild(mainContainer);
    
    this.attachEventListeners();
    return this.container;
  }

  async initializeDashboard(): Promise<void> {
    await this.populateColumns();
  }

  private async populateColumns(): Promise<void> {
    // 2. Distribui as tasks pelas colunas existentes
    for (const column of this.statusColumns) {
      const colTasks = this.tasks.filter(t => t.getStatus() === column.id);
      
      const tasksContainer = this.container.querySelector(`.tasks-container[data-status="${column.id}"]`) as HTMLElement;
      const countBadge = this.container.querySelector(`.column-count[data-status="${column.id}"]`) as HTMLElement;

      if (tasksContainer && countBadge) {
        countBadge.textContent = colTasks.length.toString();
        tasksContainer.innerHTML = ""; // Limpa apenas a lista interna da coluna
        
        for (const task of colTasks) {
          const card = await this.createTaskCard(task);
          tasksContainer.appendChild(card);
        }
      }
    }
  }

  private async createTaskCard(task: ITask): Promise<HTMLElement> {
    const card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("data-task-id", task.getId().toString());
    card.style.border = "1px solid #ddd";
    card.style.borderRadius = "8px";
    card.style.padding = "12px";
    card.style.backgroundColor = "#fff";
    card.style.cursor = "pointer";
    card.style.transition = "all 0.2s";
    card.addEventListener("mouseover", () => {
      card.style.transform = "translateY(-2px)";
      card.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    });
    card.addEventListener("mouseout", () => {
      card.style.transform = "none";
      card.style.boxShadow = "none";
    });

    const names = this.user.getName().split(" ");
    
    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.getTitle();
    title.style.margin = "0 0 8px 0";
    title.style.fontSize = "1.1em";

    // Buscar sprint associado
    let sprintName = "Sem Sprint";
    try {
      const sprintTasks = await SprintTaskService.getSprintTasks();
      const sprintTask = sprintTasks.find(
        (st: any) => st.task_id === task.getId()
      );
      
      if (sprintTask && sprintTask.sprint_id) {
        const allSprints = await SprintService.getSprints();
        const sprint: any = allSprints.find(
          (s: any) => (s.getId?.() ?? s.id) === sprintTask.sprint_id
        );
        if (sprint) {
          sprintName = (sprint.getName?.() ?? sprint.name ?? "Sprint") as string;
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar sprint:", error);
    }

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.style.display = "flex";
    meta.style.flexDirection = "column";
    meta.style.gap = "4px";
    meta.style.fontSize = "0.9em";
    meta.style.color = "#666";

    const sprintSpan = document.createElement("span");
    sprintSpan.className = "task-sprint";
    sprintSpan.textContent = sprintName;
    sprintSpan.style.fontWeight = "bold";

    const userSpan = document.createElement("span");
    userSpan.className = "task-user";
    userSpan.textContent = names[0];
    userSpan.style.fontSize = "0.8em";

    const statusSpan = document.createElement("span");
    statusSpan.className = "task-status";
    statusSpan.textContent = task.getStatus();
    statusSpan.style.fontSize = "0.8em";
    statusSpan.style.textTransform = "uppercase";

    meta.appendChild(sprintSpan);
    meta.appendChild(userSpan);
    meta.appendChild(statusSpan);

    card.appendChild(title);
    card.appendChild(meta);

    setCardBorderColor(card, getCardBorderColor(task.getStatus()));
    return card;
  }

  private attachEventListeners(): void {
    // Delegação de eventos: um único listener no container pai
    this.container.onclick = (event: MouseEvent) => {
      const card = (event.target as HTMLElement).closest(".task-card");
      if (!card) return;

      const taskId = card.getAttribute("data-task-id");
      const task = this.tasks.find(t => t.getId().toString() === taskId);
      
      if (task) this.renderStatusModal(task);
    };
  }

  private renderStatusModal(task: ITask): void {
    const modal = document.createElement("section");
    modal.className = "modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "1000";
    modal.id = `statusModal-${task.getId()}`;

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.borderRadius = "8px";
    modalContent.style.padding = "20px";
    modalContent.style.maxWidth = "500px";
    modalContent.style.width = "90%";
    modalContent.style.maxHeight = "80vh";
    modalContent.style.overflowY = "auto";

    const title = document.createElement("h2");
    title.textContent = `Alterar Estado - ${task.getTitle()}`;
    title.style.margin = "0 0 20px 0";

    const statusList = document.createElement("div");
    statusList.className = "status-list";
    statusList.style.display = "flex";
    statusList.style.flexDirection = "column";
    statusList.style.gap = "10px";

    this.statusColumns.forEach(statusCol => {
      const btn = document.createElement("button");
      btn.className = "btn status-option-btn";
      
      const isSelected = task.getStatus() === statusCol.id;
      
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.gap = "10px";
      btn.style.padding = "10px";
      btn.style.border = "1px solid #ddd";
      btn.style.borderRadius = "4px";
      btn.style.backgroundColor = isSelected ? "#007bff" : "#fff";
      btn.style.color = isSelected ? "#fff" : "#333";
      btn.style.cursor = "pointer";
      btn.style.transition = "all 0.2s";
      
      btn.innerHTML = `
        <span>
          ${isSelected ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-circle"></i>'}
        </span>
        <span>${statusCol.label}</span>
      `;
      btn.title = `Mover para ${statusCol.label}`;
      
      btn.addEventListener("mouseover", () => {
        if (!isSelected) {
          btn.style.backgroundColor = "#f0f0f0";
        }
      });
      
      btn.addEventListener("mouseout", () => {
        if (!isSelected) {
          btn.style.backgroundColor = "#fff";
        }
      });
      
      btn.addEventListener("click", async () => {
        await this.updateTaskStatus(task.getId(), statusCol.id);
        modal.remove();
      });
      
      statusList.appendChild(btn);
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn secondary";
    closeBtn.style.marginTop = "20px";
    styleTransparentButton(closeBtn, "#999", "#333");
    closeBtn.innerHTML = `<i class="fas fa-times"></i> Fechar`;
    closeBtn.addEventListener("click", () => modal.remove());

    modalContent.append(title, statusList, closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  private async updateTaskStatus(taskId: number, newStatus: string): Promise<void> {
    try {
      const task = this.tasks.find(t => t.getId() === taskId);
      if (!task) return;

      // Atualizar o status da tarefa
      await TaskService.updateTask(taskId, { status_id: this.getStatusId(newStatus) });
      
      // Aguardar um pouco para garantir que o backend processou a mudança
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Atualizar a tarefa localmente
      (task as any).setStatus(newStatus);
      
      // Recarregar a página
      await this.populateColumns();
      showInfoBanner(`Tarefa movida para ${newStatus}`, "success-banner");
    } catch (error) {
      console.error("Erro ao atualizar estado da tarefa:", error);
      showInfoBanner("Erro ao atualizar estado da tarefa", "error-banner");
    }
  }

  private getStatusId(statusLabel: string): number {
    return this.statusMap[statusLabel] || 1;
  }

  async updateTasks(newTasks: ITask[]): Promise<void> {
    this.tasks = newTasks;
    await this.populateColumns(); // Atualiza os cards sem recriar as colunas (melhor performance)
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}



