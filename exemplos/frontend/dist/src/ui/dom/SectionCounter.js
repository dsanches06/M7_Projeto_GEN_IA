import { createButton, createFigureWithImage, createInput, createSection, } from "./index.js";
/**
 * Cria qualquer seção de contador de tarefas (Total, Pendentes ou Concluídas)
 */
export function createStatisticsCounter(sectionId, imgId, src, label, counterId, captionId) {
    const figure = createFigureWithImage(imgId, `${src}`, label, captionId);
    const counterSection = createSection(counterId);
    counterSection.classList.add("counter-item");
    const wrapper = createSection(sectionId);
    wrapper.classList.add("statistics");
    wrapper.append(figure, counterSection);
    return wrapper;
}
/**
 * Cria uma seção de busca e ações genérica
 */
export function createSearchContainer(containerId, inputConfig, buttons) {
    // 1. Criar o Input de busca
    const inputSearch = createInput(inputConfig.id, "text");
    inputSearch.placeholder = inputConfig.placeholder;
    // 2. Criar o grupo de botões (form-group)
    const sectionGroup = createSection(`${containerId}Group`);
    sectionGroup.classList.add("button-group");
    // 3. Criar e adicionar os botões dinamicamente
    buttons.forEach((btn) => {
        const newBtn = createButton(btn.id, btn.text, "button");
        if (btn.className)
            newBtn.classList.add(btn.className);
        sectionGroup.append(newBtn);
    });
    // 4. Montar a seção principal
    const section = createSection(containerId);
    section.append(inputSearch, sectionGroup);
    return section;
}
