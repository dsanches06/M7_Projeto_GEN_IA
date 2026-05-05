import { createSection } from "../ui/dom/index.js";
export function showInfoBanner(message, className) {
    const banner = createSection("banner");
    banner.textContent = message;
    banner.classList.add(className);
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 2000);
}
