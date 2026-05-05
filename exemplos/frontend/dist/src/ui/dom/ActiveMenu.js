// Função para ativar o menu
export function activateMenu(menuId) {
    const allLinks = document.querySelectorAll(".js-link");
    allLinks.forEach(link => link.classList.remove("menu-actived"));
    const activeMenu = document.querySelector(menuId);
    if (activeMenu) {
        activeMenu.classList.add("menu-actived");
    }
}
