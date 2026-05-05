export function createInputGroup(
  labelStr: string,
  id: string,
  type: string,
  placeholder: string,
) {
  const section = document.createElement("section");
  section.className = "form-group";

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = labelStr;

  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.placeholder = placeholder;

  const errorSection = document.createElement("section");
  errorSection.id = `${id}Error`;
  errorSection.className = "error-message";

  section.append(label, input, errorSection);

  return { section, input, errorSection };
}

export function createSelectGroup(
  labelStr: string,
  id: string,
  options: string[],
) {
  const section = document.createElement("section");
  section.className = "form-group";

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = labelStr;

  const select = document.createElement("select");
  select.id = id;
  select.name = id;

  // Itera sobre o array de strings fornecido
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  const errorSection = document.createElement("section");
  errorSection.id = `${id}Error`;
  errorSection.className = "error-message";

  section.append(label, select, errorSection);

  return { section, select, errorSection };
}
