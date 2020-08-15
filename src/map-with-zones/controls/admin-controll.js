import mapboxgl from "mapbox-gl";
import _ from "lodash";
import { ZoneLayer } from "../layers/zone-layer";
import { generateUniqueId, getDefaultZone, getCenterZoneByCoordinates } from "../utils/zone-helpers";
import { getPlusIconSvg, getEditIconSvg, getDeleteIconSvg } from "../utils/svg-helpers";
import { enableMapInteraction, disableMapInteraction } from "../utils/map-helpers";
import { CONTROL_BASE_CLASS_NAME, POPUP_BASE_CLASS_NAME, POPUP_CONTROLS_CLASS_NAME } from "../utils/constants";
import {
    createControllButton,
    removeActiveClassForButton,
    addActiveClassForButton,
    addElementListener,
    getPopupInputColor,
    getPopupButton,
    getPopupTitle,
    getPopupInputName,
} from "../utils/dom-helpers";
import { ZoneApi } from "../api/zone-api";

export class AdminControll {
    zones = [];
    layers = new Map();
    isCreateMode = false;
    isEditMode = false;
    isDeleteMode = false;
    deleteZoneId = null;
    editZoneId = null;
    cacheZone = null;
    newZone = getDefaultZone();
    zoneApi = new ZoneApi();

    /** ID for elements */
    popupCreateId = `${CONTROL_BASE_CLASS_NAME}__popup-create`;
    popupCreateInputNameId = `${this.popupCreateId}-input-name`;
    popupCreateInputColorId = `${this.popupCreateId}-input-color`;
    popupCreateButtonSaveId = `${this.popupCreateId}-button-save`;
    popupCreateButtonCancelId = `${this.popupCreateId}-button-cancel`;

    popupDeleteId = `${CONTROL_BASE_CLASS_NAME}__popup-delete`;
    popupDeleteButtonConfirmId = `${this.popupDeleteId}-button-confirm`;
    popupDeleteButtonCancelId = `${this.popupDeleteId}-button-cancel`;

    popupEditId = `${CONTROL_BASE_CLASS_NAME}__popup-edit`;
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
        this.createButton = createControllButton(getPlusIconSvg(), this.onClickCreateButton);
        this.deleteButton = createControllButton(getDeleteIconSvg(), this.onClickDeleteButton);
        this.editButton = createControllButton(getEditIconSvg(), this.onClickEditButton);
        this.container.appendChild(this.createButton);
        this.container.appendChild(this.deleteButton);
        this.container.appendChild(this.editButton);
        this.getZones();
        return this.container;
    }

    async getZones() {
        const items = await this.zoneApi.getZoneList();
        if (!items) return;
        this.zones = items;
        this.drawZones();
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    //#region Edit zone

    onClickEditButton = () => {
        if (this.isEditMode) return this.disableEditMode();
        this.disableAllModes();
        this.enableEditMode();
    };

    addEditPopupListeners() {
        addElementListener(this.popupEditInputNameId, "change", this.editZoneName);
        addElementListener(this.popupEditInputColorId, "change", this.editZoneColor);
        addElementListener(this.popupEditButtonSaveId, "click", this.onSaveEdit);
        addElementListener(this.popupEditButtonCancelId, "click", this.cancelEditZone);
        addElementListener(this.popupEditButtonGeometryId, "click", this.onGeometryEdit);
    }

    updateEditZoneLayer() {
        if (!this.editZone || this.editZone.coordinates.length < 4) return;
        const layer = this.layers.get(this.editZone.id);
        if (!layer) return;
        layer.update(this.editZone.coordinates);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseUpEdit = (e) => {
        this.map.off("mousemove", this.onMouseMoveEdit);
        if (this.editZone) this.showEditPopup(this.editZone.id);
        enableMapInteraction(this.map);
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseMoveEdit = (e) => {
        if (!this.editZone) return;
        this.editZone.coordinates.push(e.lngLat.toArray());
        this.updateEditZoneLayer();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseDownEdit = (e) => {
        this.map.on("mousemove", this.onMouseMoveEdit);
        this.map.once("mouseup", this.onMouseUpEdit);
    };

    onGeometryEdit = () => {
        if (this.editPopup) this.editPopup.remove();
        disableMapInteraction(this.map);
        const layer = this.layers.get(this.editZone.id);
        if (layer) layer.remove();
        this.editZone.coordinates = [];
        this.map.on("mousedown", this.onMouseDownEdit);
    };

    cancelEditZone = () => {
        if (this.editZone) {
            const layer = this.layers.get(this.editZone.id);
            const zone = this.zones.find((el) => el.id === this.editZone.id);
            if (layer && zone) {
                layer.setColor(zone.color);
                layer.update(zone.coordinates);
            }
        }
        if (this.editPopup) this.editPopup.remove();
        this.editZone = null;
    };

    onSaveEdit = async () => {
        await this.zoneApi.updateZone(this.editZone);

        this.zones = this.zones.map((el) => {
            if (el.id === this.editZone.id) return this.editZone;
            return el;
        });

        if (this.editPopup) this.editPopup.remove();
        this.editZone = null;
    };

    editZoneColor = (e) => {
        const color = e.target.value;
        this.editZone.color = color;
        const layer = this.layers.get(this.editZone.id);
        if (!layer) return;
        layer.setColor(color);
    };

    editZoneName = (e) => {
        this.editZone.name = e.target.value;
    };

    getEditPopupContent({ name, color }) {
        return `
            <div class="${POPUP_BASE_CLASS_NAME}">
                ${getPopupInputName(name, this.popupEditInputNameId)}
                ${getPopupInputColor(color, this.popupEditInputColorId)}
                ${getPopupButton("Edit Geometry", this.popupEditButtonGeometryId)}
                <div class="${POPUP_CONTROLS_CLASS_NAME}">
                ${getPopupButton("Cancel", this.popupEditButtonCancelId)}
                ${getPopupButton("Save", this.popupEditButtonSaveId)}
                </div>
            </div>`;
    }

    showEditPopup() {
        const coor = getCenterZoneByCoordinates(this.editZone.coordinates);
        if (!coor) return;
        this.editPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setHTML(this.getEditPopupContent(this.editZone))
            .addTo(this.map);
        this.addEditPopupListeners();
    }

    onClickEdit = (e) => {
        const feature = this.getZoneFeatureByEvent(e);
        if (!feature) return;
        const zoneId = feature.properties.id;
        if (this.editZone && zoneId === this.editZone.id) return;
        if (this.editPopup) this.editPopup.remove();
        const zone = this.zones.find((el) => el.id === zoneId);
        if (!zone) return;
        this.editZone = _.cloneDeep(zone);
        this.showEditPopup();
    };

    enableEditMode = () => {
        addActiveClassForButton(this.editButton);
        this.addCursorPointerListener();
        this.map.on("click", this.onClickEdit);
        this.isEditMode = true;
    };

    disableEditMode = () => {
        removeActiveClassForButton(this.editButton);
        this.removeCursorPointerListener();
        this.map.off("click", this.onClickEdit);
        this.cancelEditZone();
        this.editZone = null;
        this.isEditMode = false;
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
        this.newZone = getDefaultZone();
        const id = generateUniqueId();
        this.newZone.id = id;
        this.newZonelayer = new ZoneLayer(this.map, id);
        this.map.once("mousedown", this.onMouseDownCreate);
        addActiveClassForButton(this.createButton);
        disableMapInteraction(this.map);
        this.isCreateMode = true;
    }

    disableCreateMode = () => {
        this.newZone = getDefaultZone();
        if (this.createPopup) this.createPopup.remove();
        if (this.newZonelayer) this.newZonelayer.remove();
        removeActiveClassForButton(this.createButton);
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

    setNewZoneName = (e) => {
        this.newZone.name = e.target.value;
    };

    setNewZoneColor = (e) => {
        this.newZone.color = e.target.value;
        this.updateColorInNewZone();
    };

    addCreatePopupListners() {
        addElementListener(this.popupCreateInputNameId, "change", this.setNewZoneName);
        addElementListener(this.popupCreateInputColorId, "change", this.setNewZoneColor);
        addElementListener(this.popupCreateButtonCancelId, "click", this.disableCreateMode);
        addElementListener(this.popupCreateButtonSaveId, "click", this.createZone);
    }

    createZone = () => {
        const zone = _.cloneDeep(this.newZone);
        this.zoneApi.addZone(zone);
        this.zones.push(zone);
        this.onClickCreateButton();
        this.createPopup.remove();
        this.newZonelayer.remove();
        this.drawZones();

        this.newZone = getDefaultZone();
    };

    updateColorInNewZone() {
        this.newZonelayer.setColor(this.newZone.color);
    }

    getCreatePopupContent() {
        const name = `Zone ${this.zones.length + 1}`;
        this.newZone.name = name;
        return `
            <div class=${POPUP_BASE_CLASS_NAME}>
                ${getPopupInputName(name, this.popupCreateInputNameId)}
                ${getPopupInputColor(null, this.popupCreateInputColorId)}
                <div class="${POPUP_CONTROLS_CLASS_NAME}">
                ${getPopupButton("Cancel", this.popupCreateButtonCancelId)}
                ${getPopupButton("Save", this.popupCreateButtonSaveId)}
                </div>
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
            <div class=${POPUP_BASE_CLASS_NAME}>
                ${getPopupTitle(`Do you want to delete a zone ${zoneName}?`)}
                <div class="${POPUP_CONTROLS_CLASS_NAME}">
                ${getPopupButton("Cancel", this.popupDeleteButtonCancelId)}
                ${getPopupButton("Delete", this.popupDeleteButtonConfirmId)}
                </div>
            </div>`;
    }

    addDeletePopupListeners(zoneId) {
        addElementListener(this.popupDeleteButtonConfirmId, "click", () => this.deleteZone(zoneId));
        addElementListener(this.popupDeleteButtonCancelId, "click", this.cancelDeleteZone);
    }

    cancelDeleteZone = () => {
        this.deletePopup.remove();
    };

    deleteZone = async (zoneId) => {
        await this.zoneApi.deleteZone(zoneId);
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
        addActiveClassForButton(this.deleteButton);
        this.addCursorPointerListener();
        this.isDeleteMode = true;
    }

    disableDeleteMode() {
        this.map.off("click", this.onClickDeleteZone);
        removeActiveClassForButton(this.deleteButton);

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

    //#endregion
}
