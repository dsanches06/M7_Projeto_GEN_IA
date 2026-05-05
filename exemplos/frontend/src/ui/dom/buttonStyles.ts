/**
 * Estiliza um botão com aparência transparente e border colorido
 */
export function styleTransparentButton(
  btn: HTMLElement,
  color: string = "#007bff",
  hoverColor?: string,
): void {
  if (!btn) return;

  const finalHoverColor = hoverColor || color;

  btn.style.backgroundColor = "transparent";
  btn.style.border = `2px solid ${color}`;
  btn.style.color = color;
  btn.style.padding = "8px 16px";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "14px";
  btn.style.fontWeight = "500";
  btn.style.transition = "all 0.3s ease";

  btn.addEventListener("mouseover", () => {
    btn.style.backgroundColor = color;
    btn.style.color = "white";
  });

  btn.addEventListener("mouseout", () => {
    btn.style.backgroundColor = "transparent";
    btn.style.color = color;
  });
}

/**
 * Estiliza um input de busca
 */
export function styleSearchInput(input: HTMLInputElement): void {
  if (!input) return;

  input.style.padding = "10px 15px";
  input.style.border = "1px solid #ddd";
  input.style.borderRadius = "4px";
  input.style.fontSize = "14px";
  input.style.width = "100%";
  input.style.boxSizing = "border-box";

  input.addEventListener("focus", () => {
    input.style.borderColor = "#007bff";
    input.style.boxShadow = "0 0 5px rgba(0, 123, 255, 0.5)";
  });

  input.addEventListener("blur", () => {
    input.style.borderColor = "#ddd";
    input.style.boxShadow = "none";
  });
}

/**
 * Estiliza um container de ações com layout flex
 */
export function styleActionContainer(container: HTMLElement): void {
  if (!container) return;
}

/**
 * Estiliza um container de contadores
 */
export function styleCountersContainer(container: HTMLElement): void {
  if (!container) return;
}
