import { IUser } from "../../models/index.js";
import { UserService } from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { toggleNotifications } from "./notificationBoxUI.js";

export async function createNotificationsUI(user: IUser): Promise<HTMLButtonElement> {
  const btnNotifications = document.createElement(
    "button",
  ) as HTMLButtonElement;
  btnNotifications.className = "icon-button";
  btnNotifications.addEventListener("click", async (event) => {
    event.stopPropagation();
    await toggleNotifications(user);
  });

  const spanIcone = document.createElement("span");
  const icone = document.createElement("i");

  spanIcone.appendChild(icone);

  const spanBadge = document.createElement("span") as HTMLSpanElement;
  spanBadge.className = "icon-button-badge";

  // Inicialmente mostrar um valor padrão
  spanBadge.textContent = "0";

  // Tentar obter notificações não lidas do utilizador
  try {
    const userId = user.getId();
    
    if (!userId) {
      throw new Error("UserId inválido");
    }
    
    const unreadNotifications = await UserService.getUnreadNotifications(userId);
    
    if (unreadNotifications) {
      // Contar apenas notificações não lidas
      const notifyCount = unreadNotifications.filter(n => !n.isNotificationRead()).length;
      spanBadge.textContent = notifyCount.toString();
    }
  } catch (error) {
    showInfoBanner("Erro ao carregar notificações", "error-banner");
    console.error("Erro ao obter notificações da API:", error);
    // Mostrar erro no badge para que o utilizador saiba que há um problema
    spanBadge.textContent = "!";
    spanBadge.style.backgroundColor = "#dc3545"
  }

  icone.className = "fa-solid fa-bell fa-2xl fa-shake";
  icone.style.pointerEvents = "none"

  icone.addEventListener(
    "animationend",
    () => {
      icone.classList.remove("fa-shake");
      icone.style.animation = "none" // Limpa o estilo inline
    },
    { once: true },
  );

  btnNotifications.appendChild(spanIcone);
  btnNotifications.appendChild(spanBadge);

  return btnNotifications;
}
