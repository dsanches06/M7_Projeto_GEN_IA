import { UserService, TaskService, TaskAssigneeService } from "../../services/index.js";
import { UserClass } from "../../models/index.js";
import { getAvatarPath, showInfoBanner } from "../../helpers/index.js";
import { renderUsers, showUsersCounters, loadUserTasksPage } from "./index.js";
import { toggleUserState } from "../gestUserTask/index.js";
import { showUserDetails, renderUserModal } from "../modal/index.js";
import { createSection } from "../dom/CreatePage.js";
import { activateMenu } from "../dom/index.js";

async function handleUserEdit(user: UserClass): Promise<void> {
  try {
    await renderUserModal({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      phone: user.getPhone(),
      gender: user.getGender(),
    });
  } catch (error) {
    showInfoBanner("Erro ao abrir formulário de edição.", "error-banner");
    console.error(error);
  }
}

/* Criar cartão de utilizador */
export async function createUserCard(user: UserClass): Promise<HTMLElement> {
  const divUserCard = createSection("sectionUserCard") as HTMLElement;
  divUserCard.className = "usersContainer";

  const card = document.createElement("div") as HTMLElement;
  card.className = "card";
  // Apenas flip ao clicar no card, sem abrir modal
  card.addEventListener("click", (e) => {
    e.stopPropagation();
    card.classList.toggle("flipped");
  });

  // =====================
  // FACE 1
  // =====================
  const face1 = document.createElement("div");
  face1.className = "face face1";

  const content1 = document.createElement("div");
  content1.className = "content";

  const img = document.createElement("img");
  const randomValue = Math.floor(Math.random() * 4) + 1;

  img.src = getAvatarPath(user.getId(), user.getGender(), randomValue);
  img.alt = "User Avatar";

  const h3 = document.createElement("h3");
  h3.textContent = user.getName().split(" ")[0];

  content1.append(img, h3);
  face1.appendChild(content1);

  // =====================
  // FACE 2
  // =====================
  const face2 = document.createElement("div");
  face2.className = "face face2";

  const number = document.createElement("span");
  number.className = "number";
  number.textContent = user.getId().toString();

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = user.getName();

  const email = document.createElement("span");
  email.className = "email";
  email.textContent = user.getEmail();

  const status = document.createElement("span");
  status.className = "status";
  status.textContent = user.isActive() ? "ativo" : "inativo";
  status.style.color = user.isActive() ? "green" : "red";

  const tasks = document.createElement("span");
  tasks.className = "tasks";

  try {
    const allTasks = await TaskService.getTasks();

    const count = allTasks.filter((task) => {
      const assignees = (task as any).getAssignees?.() || [];
      return assignees.some((a: any) => a.user_id === user.getId());
    }).length;

    tasks.textContent = `${count} tarefa${count !== 1 ? "s" : ""}`;
  } catch (error) {
    tasks.textContent = "0 tarefas";
    console.error("Erro ao carregar tarefas para o contador", error);
    showInfoBanner("Erro ao carregar tarefas", "error-banner");
  }

  // Container principal flexível: conteúdo à esquerda, botões à direita
  const mainRow = document.createElement("div") as HTMLElement;
  mainRow.className = "user-card-row";
  mainRow.style.display = "flex";
  mainRow.style.gap = "1rem";
  mainRow.style.alignItems = "flex-start";

  // Conteúdo principal (esquerda)
  const contentCol = document.createElement("div") as HTMLElement;
  contentCol.className = "content";
  contentCol.style.flex = "1";
  contentCol.append(number, name, email, status, tasks);

  // Botões (direita)
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "0.35rem";
  buttonContainer.style.alignItems = "flex-end";
  buttonContainer.style.flexShrink = "0";

  // Botão para ver detalhes
  const editBtn = document.createElement("button");
  editBtn.className = "icon-button";
  editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
  editBtn.title = "Editar utilizador";
  editBtn.setAttribute("aria-label", "Editar utilizador");
  editBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleUserEdit(user);
  });

  // Botão para ver detalhes
  const detailsBtn = document.createElement("button");
  detailsBtn.className = "icon-button";
  detailsBtn.innerHTML = `<i class="fas fa-eye"></i>`;
  detailsBtn.title = "Ver detalhes do utilizador";
  detailsBtn.setAttribute("aria-label", "Ver detalhes do utilizador");
  detailsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (user && user.getId()) {
      showUserDetails(user);
    } else {
      showInfoBanner("Erro: Utilizador não encontrado.", "error-banner");
    }
  });

  // Botão para ver tarefas
  const tasksBtn = document.createElement("button");
  tasksBtn.className = "icon-button";
  tasksBtn.innerHTML = `<i class="fa-solid fa-diagram-project"></i>`;
  tasksBtn.title = "Ver tarefas do utilizador";
  tasksBtn.setAttribute("aria-label", "Ver tarefas do utilizador");
  tasksBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    try {
      await loadUserTasksPage(user.getId());
    } catch (error) {
      console.error("Erro ao carregar tarefas do utilizador:", error);
      showInfoBanner("Erro ao carregar tarefas do utilizador", "error-banner");
      showInfoBanner(
        "Erro ao carregar tarefas do utilizador. Por favor, tente novamente.",
        "error-banner",
      );
    }
  });

  // Botão para adicionar atribuição de tarefa (task_assignee)
  const assignTaskBtn = document.createElement("button");
  assignTaskBtn.className = "icon-button";
  assignTaskBtn.innerHTML = `<i class="fas fa-tasks"></i><i class="fas fa-plus"></i>`;
  assignTaskBtn.title = "Atribuir tarefa ao utilizador";
  assignTaskBtn.setAttribute("aria-label", "Atribuir tarefa ao utilizador");
  assignTaskBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await renderTaskAssignModal(user, "assign");
  });

  // Botão para remover atribuição de tarefa (task_assignee)
  const removeAssignTaskBtn = document.createElement("button");
  removeAssignTaskBtn.className = "icon-button";
  removeAssignTaskBtn.innerHTML = `<i class="fas fa-tasks"></i><i class="fas fa-minus"></i>`;
  removeAssignTaskBtn.title = "Remover atribuição de tarefa do utilizador";
  removeAssignTaskBtn.setAttribute("aria-label", "Remover atribuição de tarefa do utilizador");
  removeAssignTaskBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await renderTaskAssignModal(user, "remove");
  });

  // Botão para togglear estado (ativo/inativo)
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "icon-button";
  toggleBtn.innerHTML = user.isActive()
    ? `<i class="fa-solid fa-toggle-on fa-lg"></i>`
    : `<i class="fa-solid fa-toggle-off fa-lg"></i>`;
  toggleBtn.title = "Ativar ou desativar utilizador";
  toggleBtn.setAttribute("aria-label", "Ativar ou desativar utilizador");
  toggleBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    await toggleUserState(user.getId());
    const users = await UserService.getUsers();
    await renderUsers(users as UserClass[]);
    await showUsersCounters("utilizadores");
  });

  // Botão para remover
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-button";
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.title = "Remover utilizador";
  deleteBtn.setAttribute("aria-label", "Remover utilizador");
  deleteBtn.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (1 > 0) {
      showInfoBanner(
        "Utilizador com tarefas pendentes não pode ser removido.",
        "error-banner",
      );
    } else {
      try {
        showInfoBanner("Utilizador removido com sucesso.", "info-banner");
        const users = await UserService.getUsers();
        await renderUsers(users as UserClass[]);
        await showUsersCounters("utilizadores");
      } catch (error) {
        showInfoBanner("Erro ao remover utilizador.", "error-banner");
      }
    }
  });

  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(detailsBtn);
  buttonContainer.appendChild(tasksBtn);
  buttonContainer.appendChild(assignTaskBtn);
  buttonContainer.appendChild(removeAssignTaskBtn);
  buttonContainer.appendChild(toggleBtn);
  buttonContainer.appendChild(deleteBtn);

  // Monta a linha principal: conteúdo à esquerda, botões à direita
  mainRow.appendChild(contentCol);
  mainRow.appendChild(buttonContainer);

  face2.append(mainRow);

  // montar card
  card.append(face1, face2);

  //montar a section user card
  divUserCard.appendChild(card);

  return divUserCard;
}

async function renderTaskAssignModal(
  user: UserClass,
  action: "assign" | "remove",
): Promise<void> {
  try {
    const userId = user.getId();
    const allTasks = await TaskService.getTasks();
    const allAssignees = await TaskAssigneeService.getTaskAssignees();

    // Get tasks assigned to this user
    const userAssignedTaskIds = new Set<number>(
      allAssignees
        .filter((a) => a.user_id === userId)
        .map((a) => a.task_id)
    );

    const modal = document.createElement("section");
    modal.className = "modal task-assign-modal";
    modal.id = `taskAssignModal-${userId}-${action}`;

    const content = document.createElement("div");
    content.className = "modal-content";
    content.style.maxWidth = "600px";
    content.style.width = "100%";
    content.style.padding = "1rem";

    const title = document.createElement("h2");
    title.textContent = "Gerenciar atribuições de tarefas do utilizador";

    const list = document.createElement("div");
    list.className = "task-assign-list";
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "0.5rem";
    list.style.maxHeight = "400px";
    list.style.overflowY = "auto";

    // Filtrar tarefas conforme a ação
    let filteredTasks: any[] = [];
    if (action === "assign") {
      // Mostrar apenas tarefas que o user NÃO está assigne
      filteredTasks = allTasks.filter((task) => !userAssignedTaskIds.has(task.getId()));
    } else if (action === "remove") {
      // Mostrar apenas tarefas que o user está assigne
      filteredTasks = allTasks.filter((task) => userAssignedTaskIds.has(task.getId()));
    }

    if (filteredTasks.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.padding = "1rem";
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.color = "#999";
      emptyMsg.style.fontSize = "0.9rem";
      emptyMsg.textContent =
        action === "assign"
          ? "Não há tarefas disponíveis para atribuir a este utilizador."
          : "Este utilizador não está atribuído a nenhuma tarefa.";
      list.appendChild(emptyMsg);
    } else {
      filteredTasks.forEach((task) => {
        const isAssigned = userAssignedTaskIds.has(task.getId());
        const row = document.createElement("div");
        row.className = "task-assign-row";
        row.style.display = "flex";
        row.style.gap = "0.5rem";
        row.style.alignItems = "center";
        row.style.padding = "0.5rem";
        row.style.borderBottom = "1px solid #e0e0e0";

        const label = document.createElement("span");
        label.textContent = `${task.getId()}: ${task.getTitle()}`;
        label.style.flex = "1";
        label.style.fontSize = "0.95rem";

        const button = document.createElement("button");
        button.className = "btn primary";
        if (action === "assign") {
          button.innerHTML = `<i class="fas fa-plus"></i>`;
          button.title = "Atribuir tarefa";
          button.setAttribute("aria-label", "Atribuir tarefa");
        } else {
          button.innerHTML = `<i class="fas fa-minus"></i>`;
          button.title = "Remover atribuição";
          button.setAttribute("aria-label", "Remover atribuição");
        }
        button.style.whiteSpace = "nowrap";
        button.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            if (action === "remove") {
              const assignee = allAssignees.find(
                (a) => a.task_id === task.getId() && a.user_id === userId,
              );
              if (assignee) {
                // Use task_id and user_id for deletion if id is not available
                const assigneeId = (assignee as any).id || assignee.task_id;
                await TaskAssigneeService.deleteTaskAssignee(assigneeId);
                showInfoBanner(`Atribuição da tarefa "${task.getTitle()}" removida.`, "success-banner");
              }
            } else if (action === "assign") {
              await TaskAssigneeService.createTaskAssignee({
                task_id: task.getId(),
                user_id: userId,
              });
              showInfoBanner(`Tarefa "${task.getTitle()}" atribuída ao utilizador.`, "success-banner");
            }
            modal.remove();
            activateMenu("#menuUsers");
            await loadUserTasksPage(userId);
          } catch (error) {
            showInfoBanner("Erro ao atualizar atribuição de tarefa", "error-banner");
            console.error("Erro ao atualizar atribuição de tarefa:", error);
            showInfoBanner("Erro ao atualizar atribuição de tarefa", "error-banner");
          }
        });

        row.append(label, button);
        list.appendChild(row);
      });
    }

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
  } catch (error) {
    showInfoBanner("Erro ao abrir seleção de tarefas", "error-banner");
    console.error("Erro ao renderizar modal de atribuição de tarefas:", error);
    showInfoBanner("Erro ao abrir seleção de tarefas", "error-banner");
  }
}
