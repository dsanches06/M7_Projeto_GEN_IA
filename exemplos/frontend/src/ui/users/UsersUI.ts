import { IUser, UserClass } from "../../models/index.js";
import { createSection } from "../dom/index.js";
import { createUserCard } from "./index.js";
import {generateRandomColor} from "../../helpers/index.js";

/* Container de utilizadores */
const usersContainer = createSection("usersContainer") as HTMLElement;
usersContainer.classList.add("grid-card-container");
usersContainer.style.gap = "1.5rem";

/* Função de renderização */
export async function renderUsers(users: IUser[]): Promise<HTMLElement> {
  usersContainer.innerHTML = "";
  
  // Criar todos os cartões de utilizador de forma sequencial
  const userCards: HTMLElement[] = [];
  for (const user of users) {
    userCards.push(await createUserCard(user as UserClass));
  }
  
  // Adicionar todos os cartões ao container
  userCards.forEach((card) => usersContainer.appendChild(card));
  
  // Aplicar cores aos cartões
  applyCardColors(usersContainer);
  return usersContainer;
}

/* Aplicar cores aos cartões */
function applyCardColors(usersContainer: HTMLElement): void {
  const cards = Array.from(usersContainer.querySelectorAll(".card"));
  for (const card of cards) {
    // Gerar uma cor aleatória suave
    const randomColor = generateRandomColor();
    const title = card.querySelector(".face1") as HTMLElement;
    if (title) {
      title.style.backgroundColor = randomColor;
    }
    // Corrigir seletor para o ícone dentro do botão toggle
    const toggleBtn = card.querySelector("button.icon-button[aria-label='Ativar ou desativar utilizador']") as HTMLElement;
    if (toggleBtn) {
      const icon = toggleBtn.querySelector("i") as HTMLElement;
      if (icon) {
        icon.style.color = randomColor;
      }
    }
  }
}


