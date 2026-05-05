export function showConfirmDialog(message, title = "Confirmação") {
    return new Promise((resolve) => {
        const modal = document.createElement("section");
        modal.className = "modal";
        modal.id = "confirmDialogModal";
        const content = document.createElement("section");
        content.className = "modal-content";
        const closeBtn = document.createElement("span");
        closeBtn.className = "close";
        closeBtn.innerHTML = "&times;";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "1.5rem";
        closeBtn.addEventListener("click", () => closeDialog(false));
        const heading = document.createElement("h2");
        heading.textContent = title;
        heading.style.marginTop = "0";
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        messageElement.style.marginBottom = "1.5rem";
        messageElement.style.color = "#333";
        const buttonGroup = document.createElement("div");
        buttonGroup.style.display = "flex";
        buttonGroup.style.gap = "1rem";
        buttonGroup.style.justifyContent = "flex-end";
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancelar";
        cancelButton.style.padding = "0.5rem 1rem";
        cancelButton.style.borderRadius = "4px";
        cancelButton.style.border = "1px solid #ccc";
        cancelButton.style.backgroundColor = "#f0f0f0";
        cancelButton.style.cursor = "pointer";
        cancelButton.addEventListener("click", () => closeDialog(false));
        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.textContent = "Confirmar";
        confirmButton.style.padding = "0.5rem 1rem";
        confirmButton.style.borderRadius = "4px";
        confirmButton.style.border = "none";
        confirmButton.style.backgroundColor = "#007bff";
        confirmButton.style.color = "white";
        confirmButton.style.cursor = "pointer";
        confirmButton.addEventListener("click", () => closeDialog(true));
        buttonGroup.append(cancelButton, confirmButton);
        content.append(closeBtn, heading, messageElement, buttonGroup);
        modal.append(content);
        document.body.appendChild(modal);
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        const handleOverlayClick = (event) => {
            if (event.target === modal) {
                closeDialog(false);
            }
        };
        modal.addEventListener("click", handleOverlayClick);
        const previousActiveElement = document.activeElement;
        confirmButton.focus();
        function closeDialog(result) {
            modal.removeEventListener("click", handleOverlayClick);
            modal.remove();
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
            resolve(result);
        }
    });
}
