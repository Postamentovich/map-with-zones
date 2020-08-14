import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import _ from "lodash";
import { ZoneLayer } from "../../layers/zone-layer";
import { generateUniqueId } from "../../utils/generate-unique-id";
import { getPlusIconSvg } from "../../utils/get-plus-icon-svg";
import { getDeleteIconSvg } from "../../utils/get-delete-icon-svg";
import { getEditIconSvg } from "../../utils/get-edit-icon-svg";
import { disableMapInteraction } from "../../utils/disable-map-interaction";
import { enableMapInteraction } from "../../utils/enable-map-interaction";
import "./index.scss";

export class AdminControll {
    zones = [];
    layers = new Map();
    isAddingMode = false;
    isEditingMode = false;
    isDeletingMode = false;
    buttonClassName = "admin-controll__button";
    popupInputNameId = "admin-controll-input-name";
    popupButtonSaveId = "admin-controll-save-button";
    popupButtonCancelId = "admin-controll-cancel-button";
    popupInputColorId = "admin-controll-input-color";

    /**
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        this.addButton = document.createElement("button");
        this.addButton.className = `${this.buttonClassName}`;
        this.addButton.innerHTML = getPlusIconSvg();
        this.addButton.addEventListener("click", this.onClickAddButton);

        this.deleteButton = document.createElement("button");
        this.deleteButton.className = `${this.buttonClassName}`;
        this.deleteButton.innerHTML = getDeleteIconSvg();
        this.deleteButton.addEventListener("click", this.onClickDeleteButton);

        this.editButton = document.createElement("button");
        this.editButton.className = `${this.buttonClassName}`;
        this.editButton.innerHTML = getEditIconSvg();
        this.editButton.addEventListener("click", this.onClickEditButton);

        this.container.appendChild(this.addButton);
        this.container.appendChild(this.deleteButton);
        this.container.appendChild(this.editButton);

        this.init();
        return this.container;
    }

    setNewZone() {
        this.newZone = {
            name: null,
            color: null,
            id: null,
            coordinates: [],
        };
    }

    showPopup() {
        if (this.newZone.coordinates.length < 2) return;
        const line = turf.lineString(this.newZone.coordinates);
        const polygon = turf.lineToPolygon(line);
        const center = turf.centerOfMass(polygon);
        const coor = turf.getCoord(center);
        this.newZonePopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setHTML(this.getPopupContent())
            .addTo(this.map);
        this.addPopupListners();
    }

    addPopupListners() {
        const inputName = document.getElementById(this.popupInputNameId);
        if (inputName) {
            inputName.addEventListener("change", (e) => {
                this.newZone.name = e.target.value;
            });
        }

        const inputColor = document.getElementById(this.popupInputColorId);
        if (inputColor) {
            inputColor.addEventListener("change", (e) => {
                this.newZone.color = e.target.value;
                this.updateColorInNewZone();
            });
        }

        const buttonCancel = document.getElementById(this.popupButtonCancelId);
        if (buttonCancel) buttonCancel.addEventListener("click", this.resetNewZone);

        const buttonSave = document.getElementById(this.popupButtonSaveId);
        if (buttonSave) buttonSave.addEventListener("click", this.createZone);
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

    createZone = () => {
        const zone = _.cloneDeep(this.newZone);
        this.zones.push(zone);
        this.onClickAddButton();
        this.newZonePopup.remove();
        this.drawZones();
        this.setNewZone();
    };

    updateColorInNewZone() {
        this.newZonelayer.setColor(this.newZone.color);
    }

    resetNewZone = () => {
        this.setNewZone();
        this.newZonelayer.removeLayer();
        this.newZonePopup.remove();
        this.onClickAddButton();
    };

    getPopupContent() {
        return `<div>
                <label for=${this.popupInputNameId}>Enter zone name:</label>
                <input type="text" id=${this.popupInputNameId} /></br>
                <label for=${this.popupInputColorId}>Select zone color:</label></br>
                <input type="color" id=${this.popupInputColorId} /></br>
                <button id=${this.popupButtonSaveId}>Save</button>
                <button id=${this.popupButtonCancelId}>Cancel</button>
            </div>`;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    updateZoneLayer() {
        if (this.newZone.coordinates.length < 4) return;
        this.newZonelayer.update(this.newZone.coordinates);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseUp = (e) => {
        this.map.off("mousemove", this.onMouseMove);
        this.showPopup();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseMove = (e) => {
        this.newZone.coordinates.push(e.lngLat.toArray());
        this.updateZoneLayer();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseDown = (e) => {
        this.newZone.coordinates.push(e.lngLat.toArray());
        this.map.on("mousemove", this.onMouseMove);
        this.map.once("mouseup", this.onMouseUp);
    };

    onClickAddButton = () => {
        if (this.isAddingMode) {
            enableMapInteraction(this.map);
            this.isAddingMode = false;
            this.addButton.classList.remove(`${this.buttonClassName}_active`);
        } else {
            const id = generateUniqueId();
            this.newZone.id = id;
            this.newZonelayer = new ZoneLayer(this.map, id);
            disableMapInteraction(this.map);
            this.map.once("mousedown", this.onMouseDown);
            this.isAddingMode = true;
            this.addButton.classList.add(`${this.buttonClassName}_active`);
        }
    };

    onClickDeleteButton = () => {};

    onClickEditButton = () => {};

    init() {
        this.setNewZone();
    }
}
