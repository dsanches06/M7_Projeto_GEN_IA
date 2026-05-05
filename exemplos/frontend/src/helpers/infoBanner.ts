import { createSection } from "../ui/dom/index.js";

export function showInfoBanner(message: string, className: string): void {
  const banner = createSection("banner") as HTMLElement;
  banner.textContent = message;
  banner.classList.add(className);
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2000);
}
