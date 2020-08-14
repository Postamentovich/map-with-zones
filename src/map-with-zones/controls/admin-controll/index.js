import mapboxgl from "mapbox-gl";
import _ from "lodash";
import { ZoneLayer } from "../../layers/zone-layer";
import { generateUniqueId } from "../../utils/generate-unique-id";
import { getPlusIconSvg } from "../../utils/get-plus-icon-svg";
import { getDeleteIconSvg } from "../../utils/get-delete-icon-svg";
import { getEditIconSvg } from "../../utils/get-edit-icon-svg";
import { disableMapInteraction } from "../../utils/disable-map-interaction";
import { enableMapInteraction } from "../../utils/enable-map-interaction";
import { getCenterZoneByCoordinates } from "../../utils/get-center-zone-by-coordinates";
import { DEFAULT_ZONE_LAYER_COLOR } from "../../utils/constants";
import "./index.scss";

export class AdminControll {
    zones = [];
    layers = new Map();
    isCreateMode = false;
    isEditMode = false;
    isDeleteMode = false;
    deleteZoneId = null;
    editZoneId = null;

    /** Classnames */
    baseClassName = "admin-controll";

    buttonClassName = `${this.baseClassName}__button`;
    activeButtonClassName = `${this.buttonClassName}_active`;

    popupClassName = `${this.baseClassName}__popup`;
    popupButtonClassName = `${this.baseClassName}__popup-button`;
    popupInputClassName = `${this.baseClassName}__popup-input`;
    popupLabelClassName = `${this.baseClassName}__popup-label`;
    popupTitleClassName = `${this.baseClassName}__popup-title`;

    /** ID for elements */
    popupCreateId = `${this.baseClassName}__popup-create`;
    popupCreateInputNameId = `${this.popupCreateId}-input-name`;
    popupCreateInputColorId = `${this.popupCreateId}-input-color`;
    popupCreateButtonSaveId = `${this.popupCreateId}-button-save`;
    popupCreateButtonCancelId = `${this.popupCreateId}-button-cancel`;

    popupDeleteId = `${this.baseClassName}__popup-delete`;
    popupDeleteButtonConfirmId = `${this.popupDeleteId}-button-confirm`;
    popupDeleteButtonCancelId = `${this.popupDeleteId}-button-cancel`;

    popupEditId = `${this.baseClassName}__popup-edit`;
    popupEditInputNameId = `${this.popupEditId}-input-name`;
    popupEditInputColorId = `${this.popupEditId}-input-color`;
    popupEditButtonSaveId = `${this.popupEditId}-button-save`;
    popupEditButtonCancelId = `${this.popupEditId}-button-cancel`;
    popupEditButtonGeometryId = `${this.popupEditId}-button-geometry`;

    /** Patterns */
    zoneLayerPatternId = /zone-layer-\w/i;

    /**
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        this.createButton = document.createElement("button");
        this.createButton.className = `${this.buttonClassName}`;
        this.createButton.innerHTML = getPlusIconSvg();
        this.createButton.addEventListener("click", this.onClickCreateButton);

        this.deleteButton = document.createElement("button");
        this.deleteButton.className = `${this.buttonClassName}`;
        this.deleteButton.innerHTML = getDeleteIconSvg();
        this.deleteButton.addEventListener("click", this.onClickDeleteButton);

        this.editButton = document.createElement("button");
        this.editButton.className = `${this.buttonClassName}`;
        this.editButton.innerHTML = getEditIconSvg();
        this.editButton.addEventListener("click", this.onClickEditButton);

        this.container.appendChild(this.createButton);
        this.container.appendChild(this.deleteButton);
        this.container.appendChild(this.editButton);

        this.init();
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    //#region Edit zone

    onClickEditButton = () => {
        if (this.isEditMode) {
            return this.disableEditMode();
        }
        this.disableAllModes();
        this.enableEditMode();
    };

    getEditPopupContent({ name, color }) {
        return `
            <div class=${this.popupClassName}>
                ${this.getPopupInputName(name, this.popupEditInputNameId)}
                ${this.getPopupInputColor(color, this.popupEditInputColorId)}
                ${this.getPopupButton("Save", this.popupEditButtonSaveId)}
                ${this.getPopupButton("Cancel", this.popupEditButtonCancelId)}
                ${this.getPopupButton("Edit Geometry", this.popupEditButtonGeometryId)}
            </div>`;
    }

    showEditPopup(zoneId) {
        const zone = this.zones.find((el) => el.id === zoneId);

        if (!zone) return;

        const coor = getCenterZoneByCoordinates(zone.coordinates);

        if (!coor) return;

        this.editPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setHTML(this.getEditPopupContent(zone))
            .addTo(this.map);
        // this.addDeletePopupListeners(zone.id);
    }

    onClickEdit = (e) => {
        const feature = this.getZoneFeatureByEvent(e);
        if (!feature) return;
        const zoneId = feature.properties.id;
        if (zoneId === this.editZoneId) return;
        if (this.editPopup) this.editPopup.remove();
        this.showEditPopup(zoneId);
        this.editZoneId = zoneId;
    };

    enableEditMode = () => {
        this.addActiveClassForButton(this.editButton);
        this.addCursorPointerListener();
        this.map.on("click", this.onClickEdit);
        this.isEditMode = true;
    };

    disableEditMode = () => {
        this.removeActiveClassForButton(this.editButton);
        this.removeCursorPointerListener();
        this.map.off("click", this.onClickEdit);
        this.isEditMode = false;
        this.editZoneId = null;
    };

    //#endregion

    //#region Create zone

    onClickCreateButton = () => {
        if (this.isCreateMode) {
            return this.disableCreateMode();
        }
        this.disableAllModes();
        this.enableCreateMode();
    };

    enableCreateMode() {
        this.setNewZone();
        const id = generateUniqueId();
        this.newZone.id = id;
        this.newZonelayer = new ZoneLayer(this.map, id);
        this.map.once("mousedown", this.onMouseDownCreate);
        this.addActiveClassForButton(this.createButton);
        disableMapInteraction(this.map);
        this.isCreateMode = true;
    }

    disableCreateMode = () => {
        this.setNewZone();
        if (this.createPopup) this.createPopup.remove();
        if (this.newZonelayer) this.newZonelayer.remove();
        this.removeActiveClassForButton(this.createButton);
        enableMapInteraction(this.map);
        this.isCreateMode = false;
    };

    showCreatePopup() {
        const coor = getCenterZoneByCoordinates(this.newZone.coordinates);

        if (!coor) return;

        this.createPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setHTML(this.getCreatePopupContent())
            .addTo(this.map);
        this.addCreatePopupListners();
    }

    addCreatePopupListners() {
        const inputName = document.getElementById(this.popupCreateInputNameId);
        if (inputName) {
            inputName.addEventListener("change", (e) => {
                this.newZone.name = e.target.value;
            });
        }

        const inputColor = document.getElementById(this.popupCreateInputColorId);
        if (inputColor) {
            inputColor.addEventListener("change", (e) => {
                this.newZone.color = e.target.value;
                this.updateColorInNewZone();
            });
        }

        const buttonCancel = document.getElementById(this.popupCreateButtonCancelId);
        if (buttonCancel) buttonCancel.addEventListener("click", this.disableCreateMode);

        const buttonSave = document.getElementById(this.popupCreateButtonSaveId);
        if (buttonSave) buttonSave.addEventListener("click", this.createZone);
    }

    createZone = () => {
        const zone = _.cloneDeep(this.newZone);
        this.zones.push(zone);
        this.onClickCreateButton();
        this.createPopup.remove();
        this.newZonelayer.remove();
        this.drawZones();
        this.setNewZone();
    };

    updateColorInNewZone() {
        this.newZonelayer.setColor(this.newZone.color);
    }

    getCreatePopupContent() {
        const name = `Zone ${this.zones.length + 1}`;
        this.newZone.name = name;
        return `
            <div class=${this.popupClassName}>
                ${this.getPopupInputName(name, this.popupCreateInputNameId)}
                ${this.getPopupInputColor(null, this.popupCreateInputColorId)}
                ${this.getPopupButton("Save", this.popupCreateButtonSaveId)}
                ${this.getPopupButton("Cancel", this.popupCreateButtonCancelId)}
            </div>`;
    }

    updateNewZoneLayer() {
        if (this.newZone.coordinates.length < 4) return;
        this.newZonelayer.update(this.newZone.coordinates);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseUpCreate = (e) => {
        this.map.off("mousemove", this.onMouseMoveCreate);
        this.showCreatePopup();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseMoveCreate = (e) => {
        this.newZone.coordinates.push(e.lngLat.toArray());
        this.updateNewZoneLayer();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseDownCreate = (e) => {
        this.newZone.coordinates.push(e.lngLat.toArray());
        this.map.on("mousemove", this.onMouseMoveCreate);
        this.map.once("mouseup", this.onMouseUpCreate);
    };

    //#endregion

    //#region Delete zone

    getDeletePopupContent(zoneName) {
        return `
            <div class=${this.popupClassName}>
                ${this.getPopupTitle(`Do you want to delete a zone ${zoneName}?`)}
                ${this.getPopupButton("Delete", this.popupDeleteButtonConfirmId)}
                ${this.getPopupButton("Cancel", this.popupDeleteButtonCancelId)}
            </div>`;
    }

    addDeletePopupListeners(zoneId) {
        const confirmButton = document.getElementById(this.popupDeleteButtonConfirmId);
        if (confirmButton) {
            confirmButton.addEventListener("click", () => this.deleteZone(zoneId));
        }

        const cancelButton = document.getElementById(this.popupDeleteButtonCancelId);
        if (cancelButton) {
            cancelButton.addEventListener("click", this.cancelDeleteZone);
        }
    }

    cancelDeleteZone = () => {
        this.deletePopup.remove();
    };

    deleteZone = (zoneId) => {
        this.deletePopup.remove();
        this.zones = this.zones.filter((zone) => zone.id !== zoneId);
        const layer = this.layers.get(zoneId);
        if (!layer) return;
        layer.remove();
        this.layers.delete(zoneId);
    };

    showDeletePopup(id) {
        const zone = this.zones.find((el) => el.id === id);

        if (!zone) return;

        const coor = getCenterZoneByCoordinates(zone.coordinates);

        if (!coor) return;

        this.deletePopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setHTML(this.getDeletePopupContent(zone.name))
            .addTo(this.map);
        this.addDeletePopupListeners(zone.id);
    }

    onClickDeleteZone = (e) => {
        const feature = this.getZoneFeatureByEvent(e);
        if (!feature) return;
        const zoneId = feature.properties.id;
        if (zoneId === this.deleteZoneId) return;
        if (this.deletePopup) this.deletePopup.remove();
        this.showDeletePopup(zoneId);
        this.deleteZoneId = zoneId;
    };

    enableDeletetingMode() {
        this.map.on("click", this.onClickDeleteZone);
        this.addActiveClassForButton(this.deleteButton);
        this.addCursorPointerListener();
        this.isDeleteMode = true;
    }

    disableDeleteMode() {
        this.map.off("click", this.onClickDeleteZone);
        this.removeActiveClassForButton(this.deleteButton);

        if (this.deletePopup) {
            this.deletePopup.remove();
            this.deletePopup = null;
        }

        this.removeCursorPointerListener();
        this.isDeleteMode = false;
        this.deleteZoneId = null;
    }

    onClickDeleteButton = () => {
        if (this.isDeleteMode) {
            return this.disableDeleteMode();
        }

        this.disableAllModes();
        this.enableDeletetingMode();
    };

    //#endregion

    //#region Utils

    cursorListener = (e) => {
        const feature = this.getZoneFeatureByEvent(e);
        if (feature) {
            this.map.getCanvas().style.cursor = "pointer";
        } else {
            this.map.getCanvas().style.cursor = "";
        }
    };

    addCursorPointerListener() {
        this.map.on("mousemove", this.cursorListener);
    }

    removeCursorPointerListener() {
        this.map.off("mousemove", this.cursorListener);
    }

    disableAllModes() {
        if (this.isEditMode) this.disableEditMode();
        if (this.isDeleteMode) this.disableDeleteMode();
        if (this.isCreateMode) this.disableCreateMode();
    }

    drawZones() {
        this.zones.forEach((zone) => {
            const existLayer = this.layers.get(zone.id);
            if (existLayer) return;
            const layer = new ZoneLayer(this.map, zone.id, { color: zone.color });
            layer.update(zone.coordinates);
            this.layers.set(zone.id, layer);
        });
    }

    getZoneFeatureByEvent(e) {
        const features = this.map.queryRenderedFeatures(e.point);

        if (!features.length) return;

        const feature = features.shift();

        if (!feature) return;

        if (feature.layer.id.match(this.zoneLayerPatternId)) return feature;
    }

    setNewZone() {
        this.newZone = {
            name: "",
            color: DEFAULT_ZONE_LAYER_COLOR,
            id: null,
            coordinates: [],
        };
    }

    removeActiveClassForButton(button) {
        if (button.classList.contains(this.activeButtonClassName)) {
            button.classList.remove(this.activeButtonClassName);
        }
    }

    addActiveClassForButton(button) {
        if (!button.classList.contains(this.activeButtonClassName)) {
            button.classList.add(this.activeButtonClassName);
        }
    }

    getPopupInputName(name, id) {
        return `
            <label for=${id} class="${this.popupLabelClassName}">Enter zone name:</label></br>
            <input type="text" id="${id}" value="${name || " "}" class="${this.popupInputClassName}" /></br>`;
    }

    getPopupTitle(title) {
        return `<span class="${this.popupTitleClassName}">${title || " "}</span>`;
    }

    getPopupButton(text, id) {
        return `<button id="${id}" class="${this.popupButtonClassName}">${text || " "}</button>`;
    }

    getPopupInputColor(color, id) {
        return `
            <label for="${id}" class="${this.popupLabelClassName}">Select zone color:</label></br>
            <input type="color" id="${id}" value="${color || DEFAULT_ZONE_LAYER_COLOR}" /></br>`;
    }

    init() {
        this.setNewZone();
    }
    //#endregion
}
