import { CommentService, ProjectService, TaskAssigneeService, TaskService, UserService } from "../../services/index.js";
import {
  addElementInContainer,
  createSection,
  createHeadingTitle,
  clearContainer,
  activateMenu,
} from "../dom/index.js";
import { getAvatarPath } from "../../helpers/index.js";
import { loadTasksPage } from "./TaskPageUI.js";

export async function loadTaskDetailPage(taskId: number): Promise<void> {
  clearContainer("#containerSection");

  const title = "DETALHES DA TAREFA";
  addElementInContainer("#containerSection", createHeadingTitle("h2", title));

  const detailSection = await createTaskDetailSection(taskId);
  addElementInContainer("#containerSection", detailSection);
}

async function createTaskDetailSection(taskId: number): Promise<HTMLElement> {
  const section = createSection("taskDetailSection");
  section.className = "task-detail-page";

  try {
    const task = await TaskService.getTaskById(taskId);
    const users = await UserService.getUsers();

    const projectId = task.getProject?.()?.getId?.() ?? 0;
    const project = projectId
      ? await ProjectService.getProjectById(projectId)
      : task.getProject?.();

    const tags = await TaskService.getTaskTags(taskId);
    const comments = await CommentService.getTaskComments(taskId);
    const assignees = await TaskAssigneeService.getTaskAssignees();

    const assigneeList = assignees
      .filter((assignee) => assignee.task_id === taskId)
      .map((assignee) => {
        const user = users.find((user) => user.getId() === assignee.user_id);
        return {
          name: user ? user.getName() : `Usuário ${assignee.user_id}`,
          id: assignee.user_id,
          gender: user ? user.getGender() : "Male",
        };
      });

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "task-detail-back-button";
    backButton.textContent = "← Voltar";
    backButton.addEventListener("click", async () => {
      activateMenu("#menuTasks");
      await loadTasksPage();
    });

    const page = document.createElement("div");
    page.className = "task-page";

    const header = document.createElement("div");
    header.className = "task-header";
    header.innerHTML = `
      <div>
        <span class="task-label">DETALHES DA TAREFA</span>
        <h3>${task.getTitle()}</h3>
        <span class="task-status task-detail-status">${task.getStatus()}</span>
      </div>
      <div class="task-members">
        ${assigneeList.length > 0
          ? assigneeList
              .map(
                (assignee) =>
                  `<img src="${getAvatarPath(assignee.id, assignee.gender)}" title="${assignee.name}" alt="${assignee.name}" />`,
              )
              .join("")
          : `<span class="task-members-empty">Sem responsáveis</span>`}
      </div>
    `;

    const left = document.createElement("div");
    left.className = "task-left";
    left.innerHTML = `
      <div class="task-detail-left-tags">
        ${tags.length > 0
          ? tags
              .map(
                (tag) =>
                  `<span class="task-tag-pill">${tag.name || "Tag"}</span>`,
              )
              .join("")
          : `<span class="task-detail-no-tags">Sem tags</span>`}
      </div>
      <p class="task-description">${task.getDescription() || "Sem descrição"}</p>
      <div class="task-fields">
        <div class="field">
          <span>Projeto</span>
          <strong>${project?.getName ? project.getName() : "Projeto desconhecido"}</strong>
        </div>
        <div class="field">
          <span>Categoria</span>
          <strong>${task.getTaskCategory ? task.getTaskCategory() : "Sem categoria"}</strong>
        </div>
        <div class="field">
          <span>Responsáveis</span>
          <strong>${assigneeList.length > 0 ? assigneeList.map((item) => item.name).join(", ") : "Sem responsáveis"}</strong>
        </div>
      </div>
    `;

    const right = document.createElement("div");
    right.className = "task-right";

    const commentsHeader = document.createElement("div");
    commentsHeader.className = "task-detail-comments-header";
    commentsHeader.innerHTML = `<h4>Comentários</h4><span>${comments.length} comentário${comments.length === 1 ? "" : "s"}</span>`;

    const commentsList = document.createElement("div");
    commentsList.className = "comments-list";

    if (comments.length > 0) {
      comments.forEach((comment) => {
        const author = users.find((user) => user.getId() === comment.userId);
        const commentCard = document.createElement("div");
        commentCard.className = "comment";
        commentCard.innerHTML = `
          <img class="avatar" src="${getAvatarPath(comment.userId, author?.getGender() ?? "Male")}" alt="${author?.getName() || "Usuário"}" />
          <div class="bubble">
            <div class="comment-header">
              <strong>${author ? author.getName() : "Usuário desconhecido"}</strong>
              <span>${comment.created_at ? new Date(comment.created_at).toLocaleString() : "Sem data"}</span>
            </div>
            <div class="comment-text">${comment.content}</div>
          </div>
        `;
        commentsList.appendChild(commentCard);
      });
    } else {
      const emptyComment = document.createElement("div");
      emptyComment.className = "task-detail-comment-empty";
      emptyComment.textContent = "Nenhum comentário ainda.";
      commentsList.appendChild(emptyComment);
    }

    right.append(commentsHeader, commentsList);

    const body = document.createElement("div");
    body.className = "task-body";
    body.append(left, right);

    const commentForm = document.createElement("form");
    commentForm.className = "task-detail-comment-form";
    commentForm.innerHTML = `
      <label for="commentAuthorSelect"><strong>Membro</strong></label>
      <select id="commentAuthorSelect" class="task-detail-comment-select"></select>
      <label for="commentTextArea"><strong>Comentário</strong></label>
      <textarea id="commentTextArea" class="task-detail-comment-input" rows="4" placeholder="Adicionar comentário..."></textarea>
      <button type="submit" class="task-detail-comment-submit">Enviar comentário</button>
    `;

    const authorSelect = commentForm.querySelector("#commentAuthorSelect") as HTMLSelectElement;
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.getId().toString();
      option.textContent = user.getName();
      authorSelect.appendChild(option);
    });

    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const contentInput = commentForm.querySelector("#commentTextArea") as HTMLTextAreaElement;
      const selectedUserId = Number(authorSelect.value);
      const content = contentInput.value.trim();

      if (!content) {
        contentInput.focus();
        return;
      }

      const createdComment = await CommentService.createTaskComment(taskId, {
        id: 0,
        task_id: taskId,
        userId: selectedUserId,
        content,
        created_at: new Date().toISOString(),
      });

      if (createdComment) {
        contentInput.value = "";
        await loadTaskDetailPage(taskId);
      } else {
        alert("Erro ao criar comentário. Tente novamente.");
      }
    });

    const commentInputWrapper = document.createElement("div");
    commentInputWrapper.className = "comment-input";
    commentInputWrapper.appendChild(commentForm);

    page.append(header, body, commentInputWrapper);
    section.append(backButton, page);
  } catch (error) {
    section.innerHTML = `
      <div class="empty-state">
        <p>Erro ao carregar os detalhes da tarefa.</p>
      </div>
    `;
    console.error("Erro ao carregar detalhes da tarefa:", error);
  }

  return section;
}
