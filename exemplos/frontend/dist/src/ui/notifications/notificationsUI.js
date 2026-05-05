var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserService } from "../../services/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { toggleNotifications } from "./notificationBoxUI.js";
export function createNotificationsUI(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const btnNotifications = document.createElement("button");
        btnNotifications.className = "icon-button";
        btnNotifications.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            yield toggleNotifications(user);
        }));
        const spanIcone = document.createElement("span");
        const icone = document.createElement("i");
        spanIcone.appendChild(icone);
        const spanBadge = document.createElement("span");
        spanBadge.className = "icon-button-badge";
        // Inicialmente mostrar um valor padrão
        spanBadge.textContent = "0";
        // Tentar obter notificações não lidas do utilizador
        try {
            const userId = user.getId();
            if (!userId) {
                throw new Error("UserId inválido");
            }
            const unreadNotifications = yield UserService.getUnreadNotifications(userId);
            if (unreadNotifications) {
                // Contar apenas notificações não lidas
                const notifyCount = unreadNotifications.filter(n => !n.isNotificationRead()).length;
                spanBadge.textContent = notifyCount.toString();
            }
        }
        catch (error) {
            showInfoBanner("Erro ao carregar notificações", "error-banner");
            console.error("Erro ao obter notificações da API:", error);
            // Mostrar erro no badge para que o utilizador saiba que há um problema
            spanBadge.textContent = "!";
            spanBadge.style.backgroundColor = "#dc3545";
        }
        icone.className = "fa-solid fa-bell fa-2xl fa-shake";
        icone.style.pointerEvents = "none";
        icone.addEventListener("animationend", () => {
            icone.classList.remove("fa-shake");
            icone.style.animation = "none"; // Limpa o estilo inline
        }, { once: true });
        btnNotifications.appendChild(spanIcone);
        btnNotifications.appendChild(spanBadge);
        return btnNotifications;
    });
}
