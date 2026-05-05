import { ProjectService } from "../../services/index.js";
import { IProject } from "../../projects/index.js";
import { ProjectStatsDTORequest } from "../../api/dto/index.js";

export interface ProjectStatsResponse {
  totalProjects: number;
  activeProjects: number;
  finishedProjects: number;
  inDevelopmentProjects: number;
  activePercentage: number;
  finishedPercentage: number;
}

export async function showProjectsCounters(
  type?: string,
  projects?: IProject[],
): Promise<void> {
  if ((type === "filtrados" || type === "ativos" || type === "concluidos") && projects) {
    await countAllProjects("#allProjectsCounter", projects.length);
    await countActiveProjects("#activeProjectsCounter");
    await countFinishedProjects("#finishedProjectsCounter");
    await countInDevelopmentProjects("#inDevelopmentProjectsCounter");

    countFilterProjects("#filterProjectsCounter", type!, projects.length);
    await countActivePercentage("#activeProjectsPercentageCounter", type!);
  } else {
    await countAllProjects("#allProjectsCounter");
    await countActiveProjects("#activeProjectsCounter");
    await countFinishedProjects("#finishedProjectsCounter");
    await countInDevelopmentProjects("#inDevelopmentProjectsCounter");
    countFilterProjects("#filterProjectsCounter", type!);
    await countActivePercentage("#activeProjectsPercentageCounter", type!);
  }
}

/* Contador de projetos ativos */
async function countActiveProjects(
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
  const stats: ProjectStatsDTORequest = (await ProjectService.getProjectsStats())!;
  if (section) {
    section.textContent = `${stats.activeProjects}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de projetos concluídos */
async function countFinishedProjects(
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
  const stats: ProjectStatsDTORequest = (await ProjectService.getProjectsStats())!;
  if (section) {
    section.textContent = `${stats.finishedProjects}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de projetos em desenvolvimento */
async function countInDevelopmentProjects(
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
  const stats: ProjectStatsDTORequest = (await ProjectService.getProjectsStats())!;
  if (section) {
    section.textContent = `${stats.inDevelopmentProjects}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de projetos filtrados */
function countFilterProjects(id: string, type: string, count?: number): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (count !== undefined) {
      section.textContent = `${count}`;
    } else if (type === "projectFiltered" && section.textContent !== "") {
      section.textContent = `${0}`;
    } else {
      section.textContent = "0";
    }
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de todos os projetos */
async function countAllProjects(
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
  const stats: ProjectStatsDTORequest = (await ProjectService.getProjectsStats())!;
  if (section) {
    section.textContent = `${stats.totalProjects}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Percentagem de projetos ativos */
async function countActivePercentage(
  id: string,
  type: string,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  const stats: ProjectStatsDTORequest = (await ProjectService.getProjectsStats())!;

  if (section) {
    if (type === "concluidos") {
      section.textContent = `${stats.finishedPercentage}`;
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
    const projectsPercentageCaption = document.querySelector(
      "#projectsPercentageCaption",
    ) as HTMLElement;

    const activeProjectsPercentageBtn = document.querySelector(
      "#activeProjectsPercentageBtn",
    ) as HTMLImageElement;

    if (projectsPercentageCaption && activeProjectsPercentageBtn) {
      switch (type) {
        case "concluidos":
          activeProjectsPercentageBtn.title =
            "Mostrar percentagem de projetos concluídos";
          activeProjectsPercentageBtn.src = "./src/assets/grafico.png";
          projectsPercentageCaption.textContent = "concluídos %";
          break;
        case "projetos":
        case "ativos":
          activeProjectsPercentageBtn.title =
            "Mostrar percentagem de projetos ativos";
          activeProjectsPercentageBtn.src = "./src/assets/percentagem.png";
          projectsPercentageCaption.textContent = "ativos %";
          break;
        default:
      }
    } else {
      console.warn(
        `Elemento projectsPercentageCaption não foi encontrado no DOM.`,
      );
    }
  }
}
