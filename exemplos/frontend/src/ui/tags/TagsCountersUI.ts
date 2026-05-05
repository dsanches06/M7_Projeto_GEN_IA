import { TagService } from "../../services/index.js";

export async function showTagsCounters(
  type?: string,
  tags?: any[],
): Promise<void> {
  if ((type === "filtradas" || type === "tags") && tags) {
    countAllTags("#allTagsCounter", tags.length);
    countFilteredTags("#filterTagsCounter", type!, tags.length);
  } else {
    await countAllTags("#allTagsCounter");
    countFilteredTags("#filterTagsCounter", type!);
  }
}

async function countAllTags(id: string, overrideValue?: number): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  try {
    const tags = await TagService.getTags();
    if (section) {
      section.textContent = `${tags.length}`;
    }
  } catch (error) {
    console.error("Erro ao contar tags:", error);
    if (section) {
      section.textContent = "0";
    }
  }
}

function countFilteredTags(
  id: string,
  type: string,
  overrideValue?: number,
): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (overrideValue !== undefined) {
      section.textContent = `${overrideValue}`;
    } else {
      section.textContent = "0";
    }
  }
}
