import { TagService } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadTagsPage } from "../tags/index.js";

export async function loadInitialTags(): Promise<void> {
  clearContainer("#containerSection");
  const tags = await TagService.getTags();
  await loadTagsPage(tags);
}
