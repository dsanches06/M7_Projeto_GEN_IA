/* Função para criar um título de página (elemento h2) */
export function createHeadingTitle(element, title) {
    const titleElement = document.createElement(`${element}`);
    titleElement.textContent = `${title}`;
    return titleElement;
}
/* Função para criar uma seção (elemento section) */
export function createSection(id) {
    const section = document.createElement("section");
    section.id = `${id}`;
    return section;
}
/* Função que cria uma estrutura completa de Figure com Imagem e Legenda */
export function createFigureWithImage(id, src, label, captionId) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.id = id;
    img.src = src;
    img.alt = `imagem de ${label}`;
    img.role = "button";
    img.tabIndex = 0;
    img.classList.add("counters-img");
    const figCaption = document.createElement("figcaption");
    if (captionId) {
        figCaption.id = captionId;
    }
    else if (label === "ativos %") {
        let ativeLabel = label.split(" ");
        figCaption.id = `${ativeLabel[0].trim()}PercentageCaption`;
    }
    else {
        figCaption.id = `${label}Caption`;
    }
    figCaption.textContent = `${label}`;
    // Adiciona a imagem e a legenda à figure
    figure.append(img, figCaption);
    return figure;
}
/* Função para criar um formulário (elemento form) */
export function createForm(id) {
    const form = document.createElement("form");
    form.id = `${id}`;
    return form;
}
/* Função para criar um rótulo (elemento label) */
export function createLabel(id, htmlFor) {
    const label = document.createElement("label");
    label.id = `${id}`;
    label.htmlFor = `${htmlFor}`;
    return label;
}
/* Função para criar um input (elemento input) */
export function createInput(id, type) {
    const input = document.createElement("input");
    input.id = `${id}`;
    input.type = `${type}`;
    return input;
}
/* Função para criar um select (elemento select) */
export function createSelect(id) {
    const select = document.createElement("select");
    select.id = `${id}`;
    return select;
}
/* Função para criar uma option (elemento option) */
export function createOption(value) {
    const option = document.createElement("option");
    option.text = `${value}`;
    option.value = `${value}`;
    return option;
}
/* Função para criar um botão (elemento button) */
export function createButton(id, text, type) {
    const button = document.createElement("button");
    button.id = `${id}`;
    button.textContent = `${text}`;
    button.type = `${type}`;
    return button;
}
