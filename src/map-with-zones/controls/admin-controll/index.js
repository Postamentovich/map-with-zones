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
import "./index.scss";

export class AdminControll {
    zones = [];
    layers = new Map();
    isCreateMode = false;
    isEditMode = false;
    isDeleteMode = false;

    /** Classnames */
    baseClassName = "admin-controll";

    buttonClassName = `${this.baseClassName}__button`;
    activeButtonClassName = `${this.buttonClassName}_active`;

    popupClassName = `${this.baseClassName}__popup`;
    popupButtonClassName = `${this.baseClassName}__popup-button`;
    popupInputClassName = `${this.baseClassName}__popup-input`;

    /** ID for elements */
    popupCreateId = `${this.baseClassName}__popup-create`;
    popupCreateInputNameId = `${this.popupCreateId}-input-name`;
    popupCreateInputColorId = `${this.popupCreateId}-input-color`;
    popupCreateButtonSaveId = `${this.popupCreateId}-button-save`;
    popupCreateButtonCancelId = `${this.popupCreateId}-button-cancel`;

    popupDeleteId = `${this.baseClassName}__popup-delete`;
    popupDeleteButtonConfirmId = `${this.popupDeleteId}-button-confirm`;
    popupDeleteButtonCancelId = `${this.popupDeleteId}-button-cancel`;

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

    //#region Create zone
    onClickCreateButton = () => {
        if (this.isCreateMode) {
            this.disableCreateMode();
        } else {
            this.enableCreateMode();

            if (this.isDeleteMode) this.disableDeleteMode();
        }
    };

    enableCreateMode() {
        this.setNewZone();
        const id = generateUniqueId();
        this.newZone.id = id;
        this.newZonelayer = new ZoneLayer(this.map, id);
        disableMapInteraction(this.map);
        this.map.once("mousedown", this.onMouseDownCreate);
        this.isCreateMode = true;
        this.createButton.classList.add(`${this.buttonClassName}_active`);
    }

    disableCreateMode = () => {
        enableMapInteraction(this.map);
        this.isCreateMode = false;
        this.createButton.classList.remove(`${this.buttonClassName}_active`);
        if (this.createPopup) this.createPopup.remove();
        if (this.newZonelayer) this.newZonelayer.remove();
        this.setNewZone();
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
        return `<div>
                <label for=${this.popupCreateInputNameId}>Enter zone name:</label>
                <input type="text" id=${this.popupCreateInputNameId} /></br>
                <label for=${this.popupCreateInputColorId}>Select zone color:</label></br>
                <input type="color" id=${this.popupCreateInputColorId} /></br>
                <button id=${this.popupCreateButtonSaveId}>Save</button>
                <button id=${this.popupCreateButtonCancelId}>Cancel</button>
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
        return `<div>
                <span>Do you want to delete a zone ${zoneName}?</span>
                <button class=${this.popupButtonClassName} id=${this.popupDeleteButtonConfirmId}>Delete</button>
                <button class=${this.popupButtonClassName} id=${this.popupDeleteButtonCancelId}>Cancel</button>
            </div>`;
    }

    addDeletePopupListeners(zoneId) {
        const confirmButton = document.getElementById(this.popupDeleteButtonConfirmId);
        if (confirmButton) {
            confirmButton.addEventListener("click", () => this.deleteZone(zoneId));
        }

        const cancelButton = document.getElementById(this.popupDeleteButtonCancelId);
        if (cancelButton) {
            cancelButton.addEventListener("click", this.cancelDeletingZone);
        }
    }

    cancelDeletingZone = () => {
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
        const features = this.map.queryRenderedFeatures(e.point);
        const feature = features.shift();
        if (feature && feature.layer.id.match(this.zoneLayerPatternId)) {
            this.showDeletePopup(feature.properties.id);
        }
    };

    enableDeletetingMode() {
        this.map.on("click", this.onClickDeleteZone);

        if (!this.deleteButton.classList.contains(this.activeButtonClassName)) {
            this.deleteButton.classList.add(this.activeButtonClassName);
        }

        this.isDeleteMode = true;
    }

    disableDeleteMode() {
        this.map.off("click", this.onClickDeleteZone);

        if (this.deleteButton.classList.contains(this.activeButtonClassName)) {
            this.deleteButton.classList.remove(this.activeButtonClassName);
        }

        if (this.deletePopup) this.deletePopup.remove();

        this.isDeleteMode = false;
    }

    onClickDeleteButton = () => {
        if (this.isDeleteMode) {
            this.disableDeleteMode();
        } else {
            this.enableDeletetingMode();

            if (this.isCreateMode) this.disableCreateMode();
        }
    };

    //#endregion

    //#region Utils

    drawZones() {
        this.zones.forEach((zone) => {
            const existLayer = this.layers.get(zone.id);
            if (existLayer) return;
            const layer = new ZoneLayer(this.map, zone.id, { color: zone.color });
            layer.update(zone.coordinates);
            this.layers.set(zone.id, layer);
        });
    }

    setNewZone() {
        this.newZone = {
            name: null,
            color: null,
            id: null,
            coordinates: [],
        };
    }

    onClickEditButton = () => {};

    init() {
        this.setNewZone();
    }
    //#endregion
}
