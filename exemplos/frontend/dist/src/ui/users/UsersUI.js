var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createSection } from "../dom/index.js";
import { createUserCard } from "./index.js";
import { generateRandomColor } from "../../helpers/index.js";
/* Container de utilizadores */
const usersContainer = createSection("usersContainer");
usersContainer.classList.add("grid-card-container");
usersContainer.style.gap = "1.5rem";
/* Função de renderização */
export function renderUsers(users) {
    return __awaiter(this, void 0, void 0, function* () {
        usersContainer.innerHTML = "";
        // Criar todos os cartões de utilizador de forma sequencial
        const userCards = [];
        for (const user of users) {
            userCards.push(yield createUserCard(user));
        }
        // Adicionar todos os cartões ao container
        userCards.forEach((card) => usersContainer.appendChild(card));
        // Aplicar cores aos cartões
        applyCardColors(usersContainer);
        return usersContainer;
    });
}
/* Aplicar cores aos cartões */
function applyCardColors(usersContainer) {
    const cards = Array.from(usersContainer.querySelectorAll(".card"));
    for (const card of cards) {
        // Gerar uma cor aleatória suave
        const randomColor = generateRandomColor();
        const title = card.querySelector(".face1");
        if (title) {
            title.style.backgroundColor = randomColor;
        }
        // Corrigir seletor para o ícone dentro do botão toggle
        const toggleBtn = card.querySelector("button.icon-button[aria-label='Ativar ou desativar utilizador']");
        if (toggleBtn) {
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                icon.style.color = randomColor;
            }
        }
    }
}
