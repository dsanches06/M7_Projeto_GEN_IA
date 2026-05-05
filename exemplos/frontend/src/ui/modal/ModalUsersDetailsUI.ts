import { UserClass } from "../../models/index.js";

/* */ 
export function showUserDetails(user: UserClass) {
  const modal = document.createElement("section") as HTMLElement;
  modal.id = "modalUserDetails";
  modal.className = "modal";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center"

  const modalContent = document.createElement("section") as HTMLElement;
  modalContent.className = "modal-content";

  const closeBtn = document.createElement("span") as HTMLSpanElement;
  closeBtn.className = "close";
  closeBtn.textContent = "×";

  const userDetails = modalUserDetail(user);
  userDetails.id = "userDetails";
  userDetails.className = "user-details";

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(userDetails);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  closeBtn.onclick = () => {
    modal.remove();
  };
}

/* Função que cria o modal para mostrar detalhes do utilizador */
function modalUserDetail(user: UserClass): HTMLElement {
  const title = document.createElement("h3") as HTMLHeadingElement;
  title.id = "detailTitle";
  title.textContent = "Detalhes do Utilizador";

  const detailName = document.createElement("p") as HTMLParagraphElement;
  detailName.id = "detailName";
  detailName.innerHTML = `<strong>Nome:</strong> ${user.getName()}`;

  const detailEmail = document.createElement("p") as HTMLParagraphElement;
  detailEmail.id = "detailEmail";
  detailEmail.innerHTML = `<strong>Email:</strong> ${user.getEmail()}`;

  const detailId = document.createElement("p") as HTMLParagraphElement;
  detailId.id = "detailId";
  detailId.innerHTML = `<strong>ID:</strong> ${user.getId()}`;

  const detailStatus = document.createElement("p") as HTMLParagraphElement;
  detailStatus.id = "detailStatus";
  detailStatus.innerHTML = `<strong>Status:</strong>
   <span>${
     user.isActive() ? "Activo" : "Inactivo"
   }</span>`;

  const userTasksDetails = modalUserTask(user);
  userTasksDetails.className = "user-tasks-details";

  const userDetails = document.createElement("section") as HTMLElement;
  userDetails.appendChild(title);
  userDetails.appendChild(detailId);
  userDetails.appendChild(detailName);
  userDetails.appendChild(detailEmail);
  userDetails.appendChild(detailStatus);
  userDetails.appendChild(userTasksDetails);

  return userDetails;
}

/* Função que cria o modal para mostrar detalhes do tulizador */
function modalUserTask(user: UserClass): HTMLElement {
  //cria um subtítulo
  const sectionTitle = document.createElement("h4") as HTMLHeadingElement;
  sectionTitle.className = "detailTasksTitle";
  sectionTitle.textContent = "Tarefas do Utilizador";

  //criar uma lista não ordenada
  const ul = document.createElement("ul") as HTMLUListElement;
  //por cada tarefa do utilizador
  /*user.getTasks().forEach((task) => {
    const li = document.createElement("li") as HTMLLIElement;
    li.textContent = `${task.getTitle()} - ${
      task.getCompleted() ? "Concluído" : "Pendente"
    } - ${task.getTaskCategory()} - ${
      task.getCompletedDate()
        ? task.getCompletedDate().toLocaleDateString("pt-PT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A"
    }`*/
    //ul.appendChild(li);
  //});

  //criar uma nova section
  const section = document.createElement("section") as HTMLElement;
  section.appendChild(sectionTitle);
  section.appendChild(ul);
  return section;
}
