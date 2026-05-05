/* Funções para manipular o container principal */
export function addElementInContainer(id, element) {
    const container = document.querySelector(id);
    if (container) {
        container.appendChild(element);
    }
}
/* Função para limpar o container principal */
export function clearContainer(id) {
    const container = document.querySelector(id);
    if (container) {
        container.innerHTML = "";
    }
}
