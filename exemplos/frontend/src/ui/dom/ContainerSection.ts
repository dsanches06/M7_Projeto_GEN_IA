/* Funções para manipular o container principal */
export function addElementInContainer(id: string, element: HTMLElement): void {
  const container = document.querySelector(id);
  if (container) {
    container.appendChild(element);
  }
}

/* Função para limpar o container principal */
export function clearContainer(id: string): void {
  const container = document.querySelector(id);
  if (container) {
    container.innerHTML = "";
  }
}
