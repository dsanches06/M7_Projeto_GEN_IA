import { UserService } from "../../services/index.js";
import { IUser } from "../../models/index.js";
import { UserStatsDTORequest } from "../../api/dto/index.js";

export async function showUsersCounters(
  type?: string,
  users?: IUser[],
): Promise<void> {
  if (
    (type === "inativos" || type === "ativos" || type === "filtrados") &&
    users
  ) {
    countAllUsers("#allUsersCounter", users.length);

    if (type === "ativos") {
      countAtiveUsers("#ativeUsersCounter", users.length);
      countUnableUsers("#unableUsersCounter", 0);
    } else if (type === "inativos") {
      countUnableUsers("#unableUsersCounter", users.length);
      countAtiveUsers("#ativeUsersCounter", 0);
    } else {
      countAtiveUsers("#ativeUsersCounter", users.length);
      countUnableUsers("#unableUsersCounter", users.length);
    }

    countFilterUsers("#filterUsersCounter", type!, users.length);
    await countAtiveInativePercentage("#ativeUsersPercentageCounter", type!);
  } else {
    await countAllUsers("#allUsersCounter");
    await countAtiveUsers("#ativeUsersCounter");
    await countUnableUsers("#unableUsersCounter");
    countFilterUsers("#filterUsersCounter", type!);
    await countAtiveInativePercentage("#ativeUsersPercentageCounter", type!);
  }
}

/* Contador de utilizadores ativos */
async function countAtiveUsers(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: UserStatsDTORequest = (await UserService.getUserStats())!;
  if (section) {
    section.textContent = `${stats.activeUsers}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de utilizadores inativos */
async function countUnableUsers(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: UserStatsDTORequest = (await UserService.getUserStats())!;
  if (section) {
    section.textContent = `${stats.inactiveUsers}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de utilizadores filtrados por nome */
function countFilterUsers(id: string, type: string, count?: number): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (count !== undefined) {
      section.textContent = `${count}`;
    } else if (type === "userFiltered" && section.textContent !== "") {
      section.textContent = `${0}`;
    } else {
      section.textContent = "0";
    }
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de utilizadores */
async function countAllUsers(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: UserStatsDTORequest = (await UserService.getUserStats())!;
  if (section) {
    section.textContent = `${stats.totalUsers}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Percentagem de utilizadores ativos */
async function countAtiveInativePercentage(
  id: string,
  type: string,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  const stats: UserStatsDTORequest = (await UserService.getUserStats())!;
  if (section) {
    if (type === "inactivos") {
      section.textContent = `${stats.inactivePercentage}`;
    } else {
      section.textContent = `${stats.activePercentage}`;
    }
    changeImageAndFigCaption(type!);
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

function changeImageAndFigCaption(type: string) {
  if (type) {
    const ativosPercentangeCaption = document.querySelector(
      "#ativosPercentangeCaption",
    ) as HTMLElement;

    const ativeUsersPercentageBtn = document.querySelector(
      "#ativeUsersPercentageBtn",
    ) as HTMLImageElement;

    if (ativosPercentangeCaption && ativeUsersPercentageBtn) {
      switch (type) {
        case "inactivos":
          ativeUsersPercentageBtn.title =
            "Mostrar percentagem de utilizadores inactivos";
          ativeUsersPercentageBtn.src = "./src/assets/grafico.png";
          ativosPercentangeCaption.textContent = "inactivos %";
          break;
        case "utilizadores":
        case "activos":
          ativeUsersPercentageBtn.title =
            "Mostrar percentagem de utilizadores activos";
          ativeUsersPercentageBtn.src = "./src/assets/percentagem.png";
          ativosPercentangeCaption.textContent = "activos %";
          break;
        default:
      }
    } else {
      console.warn(`Elemento ativosCaption não foi encontrado no DOM.`);
    }
  }
}
