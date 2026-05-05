/* Função para criar um título de página (elemento h2) */
export function createHeadingTitle(
  element: string,
  title: string,
): HTMLElement {
  const titleElement = document.createElement(
    `${element}`,
  ) as HTMLHeadingElement;
  titleElement.textContent = `${title}`;
  return titleElement;
}

/* Função para criar uma seção (elemento section) */
export function createSection(id: string): HTMLElement {
  const section = document.createElement("section") as HTMLElement;
  section.id = `${id}`;
  return section;
}

/* Função que cria uma estrutura completa de Figure com Imagem e Legenda */
export function createFigureWithImage(
  id: string,
  src: string,
  label: string,
  captionId?: string,
): HTMLElement {
  const figure = document.createElement("figure");

  const img = document.createElement("img") as HTMLImageElement;
  img.id = id;
  img.src = src;
  img.alt = `imagem de ${label}`;
  img.role = "button";
  img.tabIndex = 0;
  img.classList.add("counters-img");

  const figCaption = document.createElement("figcaption");
  if (captionId) {
    figCaption.id = captionId;
  } else if (label === "ativos %") {
    let ativeLabel = label.split(" ");
    figCaption.id = `${ativeLabel[0].trim()}PercentageCaption`;
  } else {
    figCaption.id = `${label}Caption`;
  }
  figCaption.textContent = `${label}`;

  // Adiciona a imagem e a legenda à figure
  figure.append(img, figCaption);

  return figure;
}

/* Função para criar um formulário (elemento form) */
export function createForm(id: string): HTMLFormElement {
  const form = document.createElement("form") as HTMLFormElement;
  form.id = `${id}`;
  return form;
}

/* Função para criar um rótulo (elemento label) */
export function createLabel(id: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement("label") as HTMLLabelElement;
  label.id = `${id}`;
  label.htmlFor = `${htmlFor}`;
  return label;
}

/* Função para criar um input (elemento input) */
export function createInput(id: string, type: string) {
  const input = document.createElement("input") as HTMLInputElement;
  input.id = `${id}`;
  input.type = `${type}`;
  return input;
}

/* Função para criar um select (elemento select) */
export function createSelect(id: string): HTMLSelectElement {
  const select = document.createElement("select") as HTMLSelectElement;
  select.id = `${id}`;
  return select;
}

/* Função para criar uma option (elemento option) */
export function createOption(value: string): HTMLOptionElement {
  const option = document.createElement("option") as HTMLOptionElement;
  option.text = `${value}`;
  option.value = `${value}`;
  return option;
}

/* Função para criar um botão (elemento button) */
export function createButton(
  id: string,
  text: string,
  type: "submit" | "reset" | "button",
): HTMLButtonElement {
  const button = document.createElement("button") as HTMLButtonElement;
  button.id = `${id}`;
  button.textContent = `${text}`;
  button.type = `${type}`;
  return button;
}
