import { IUser } from "../../models/index.js";
import Notifications from "../../notifications/Notifications.js";
import { UserService } from "../../services/index.js";
import { addElementInContainer, createSection } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";

let isNotificationBoxOpen = false;

function createNotificationItem(data: Notifications): HTMLDivElement {
  const item = document.createElement("div");
  item.className = "notifi-item";

  const textDiv = document.createElement("div");
  textDiv.className = "text";

  const title = document.createElement("strong");
  title.textContent = data.getTitle();

  const p = document.createElement("p");
  p.textContent = data.getMessage();

  const sentAt = document.createElement("small");
  sentAt.textContent = new Date(data.getSentAt()).toLocaleString("pt-PT");
  sentAt.style.fontSize = "12px";
  sentAt.style.color = "#999";

  textDiv.appendChild(title);
  textDiv.appendChild(p);
  textDiv.appendChild(sentAt);

  item.appendChild(textDiv);

  return item;
}

/**
 * Renderiza todas as notificações no contentor
 */
async function renderNotifications(user: IUser): Promise<void> {
  let box = document.querySelector("#box") as HTMLElement;

  // Se o elemento não existir, cria-o e adiciona ao documento
  if (!box) {
    box = createSection("box") as HTMLElement;
    box.className = "notifi-box";

    // Adiciona um título
    const h2 = document.createElement("h2");
    h2.textContent = "Notificações";
    box.appendChild(h2);

    document.body.appendChild(box);
  } else {
    // Limpa itens antigos, mantendo apenas o título H2
    const title = box.querySelector("h2");
    const items = box.querySelectorAll(".notifi-item");
    items.forEach((item) => item.remove());
  }

  // Buscar notificações da API
  try {
    const notifications = await UserService.getNotificationsByUser(user.getId());

    // Atualizar título com contagem
    const h2 = box.querySelector("h2");
    if (h2) {
      h2.textContent = `Notificações (${notifications.length})`;
    }

    // Adiciona os novos itens
    if (notifications && notifications.length > 0) {
      notifications.forEach((notif) => {
        box.appendChild(createNotificationItem(notif));
      });
    } else {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "Sem notificações";
      emptyMsg
      emptyMsg
      box.appendChild(emptyMsg);
    }
  } catch (error) {
    showInfoBanner("Erro ao carregar notificações", "error-banner");
    console.error("Erro ao carregar notificações:", error);
    const errorMsg = document.createElement("p");
    errorMsg.textContent = "Erro ao carregar notificações";
    errorMsg
    errorMsg
    box.appendChild(errorMsg);
  }
}

export async function toggleNotifications(user: IUser): Promise<void> {
  await renderNotifications(user);

  const box = document.querySelector("#box") as HTMLElement;

  if (!box) {
    console.warn("Notification box element not found");
    return;
  }

  if (isNotificationBoxOpen) {
    box.classList.remove("open");
    box.classList.remove("bottom");
    isNotificationBoxOpen = false;
  } else {
    // Detecta se deve aparecer de baixo ou de cima
    const notificationButton = document.querySelector("button.icon-button");

    if (notificationButton) {
      const buttonRect = notificationButton.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;

      // Se há menos de 650px de espaço abaixo, posiciona de baixo para cima
      if (spaceBelow < 650) {
        box.classList.add("bottom");
      } else {
        box.classList.remove("bottom");
      }
    }

    box.classList.add("open");
    isNotificationBoxOpen = true;
  }
}
