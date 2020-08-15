import {
    CONTROL_BUTTON_CLASS_NAME,
    CONTROL_BUTTON_ACTIVE_CLASS_NAME,
    POPUP_LABEL_CLASS_NAME,
    DEFAULT_ZONE_LAYER_COLOR,
    POPUP_BUTTON_CLASS_NAME,
    POPUP_TITLE_CLASS_NAME,
    POPUP_INPUT_CLASS_NAME,
    POPUP_COLOR_CLASS_NAME,
    TABLE_BASE_CLASS_NAME,
    TABLE_TITLE_CLASS_NAME,
    TABLE_ZONES_CLASS_NAME,
    MAP_ID,
} from "./constants";

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

export function addElementListener(id, event, callback) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, callback);
    }
}

export function removeElementListener(id, event, callback) {
    const element = document.getElementById(id);
    if (element) {
        element.removeEventListener(event, callback);
    }
}

export function getPopupInputColor(color, id) {
    return `
        <div class="${POPUP_COLOR_CLASS_NAME}">
            <label for="${id}" class="${POPUP_LABEL_CLASS_NAME}">Select zone color:</label>
            <input type="color" id="${id}" value="${color || DEFAULT_ZONE_LAYER_COLOR}" />
        </div>
        `;
}

export function getPopupButton(text, id) {
    return `<button id="${id}" class="${POPUP_BUTTON_CLASS_NAME}">${text || " "}</button>`;
}

export function getPopupTitle(title) {
    return `<span class="${POPUP_TITLE_CLASS_NAME}">${title || " "}</span>`;
}

export function getPopupInputName(name, id) {
    return `
        <label for=${id} class="${POPUP_LABEL_CLASS_NAME}">Enter zone name:</label></br>
        <input type="text" id="${id}" value="${name || " "}" class="${POPUP_INPUT_CLASS_NAME}" /></br>`;
}

export function getPopupInputRadius(radius, id) {
    return `
        <label for=${id} class="${POPUP_LABEL_CLASS_NAME}">Enter radius (km):</label></br>
        <input type="number" id="${id}" value="${radius || 0}" class="${POPUP_INPUT_CLASS_NAME}" /></br>`;
}

export function createUserControllTable() {
    const map = document.getElementById(MAP_ID);

    if (!map) return;

    const table = document.createElement("div");
    table.className = TABLE_BASE_CLASS_NAME;

    const title = document.createElement("span");
    title.className = TABLE_TITLE_CLASS_NAME;
    title.id = TABLE_TITLE_CLASS_NAME;

    const zones = document.createElement("div");
    zones.className = TABLE_ZONES_CLASS_NAME;
    zones.id = TABLE_ZONES_CLASS_NAME;

    table.appendChild(title);
    table.appendChild(zones);
    map.appendChild(table);
}

export function setUserTableTitle(title) {
    const titleElement = document.getElementById(TABLE_TITLE_CLASS_NAME);
    if (!titleElement) return;
    titleElement.innerText = title;
}

