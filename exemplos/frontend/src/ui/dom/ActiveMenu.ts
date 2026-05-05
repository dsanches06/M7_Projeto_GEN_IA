// Função para ativar o menu
export function activateMenu(menuId: string) {
  const allLinks = document.querySelectorAll(".js-link");
  allLinks.forEach(link => link.classList.remove("menu-actived"));
  
  const activeMenu = document.querySelector(menuId) as HTMLElement;
  if (activeMenu) {
    activeMenu.classList.add("menu-actived");
  }
}
