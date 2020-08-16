import { CONTROL_BUTTON_CLASS_NAME, CONTROL_BUTTON_ACTIVE_CLASS_NAME } from "./constants";

export function createControllButton(content, callback) {
    const button = document.createElement("button");
    button.className = CONTROL_BUTTON_CLASS_NAME;
    button.innerHTML = content;
    button.addEventListener("click", callback);
    return button;
}

export function removeActiveClassForButton(button) {
    if (button.classList.contains(CONTROL_BUTTON_ACTIVE_CLASS_NAME)) {
        button.classList.remove(CONTROL_BUTTON_ACTIVE_CLASS_NAME);
    }
}

export function addActiveClassForButton(button) {
    if (!button.classList.contains(CONTROL_BUTTON_ACTIVE_CLASS_NAME)) {
        button.classList.add(CONTROL_BUTTON_ACTIVE_CLASS_NAME);
    }
}
