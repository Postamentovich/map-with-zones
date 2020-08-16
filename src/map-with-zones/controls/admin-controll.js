import mapboxgl from "mapbox-gl";
import ReactDOM from "react-dom";
import React from "react";
import _ from "lodash";
import { ZoneLayer } from "../layers/zone-layer";
import { generateUniqueId, getDefaultZone, getCenterZoneCoorByCoordinates } from "../utils/zone-helpers";
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
import { Popup } from "../componets/popup";
import { EditPopup } from "../componets/edit-popup";
import { CreatePopup } from "../componets/create-popup";
import { DeletePopup } from "../componets/delete-popup";

export class AdminControll {
    isCreateMode = false;
    isEditMode = false;
    isDeleteMode = false;
    deleteZoneId = null;
    editZoneId = null;
    cacheZone = null;
    newZone = getDefaultZone();

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
     *
     * @param {ZoneControll} zoneControll
     */
    constructor(zoneControll) {
        this.zoneControll = zoneControll;
        this.zoneApi = new ZoneApi();
    }

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
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.disableAllModes();
        this.map = undefined;
    }

    //#region Edit zone

    onClickEditButton = () => {
        if (this.isEditMode) return this.disableEditMode();
        this.disableAllModes();
        this.enableEditMode();
    };

    updateEditZoneLayer() {
        if (!this.editZone || this.editZone.coordinates.length < 4) return;
        this.zoneControll.updateZoneCoordinates(this.editZone.id, this.editZone.coordinates);
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
        this.zoneControll.removeZoneLayer(this.editZone.id);
        this.editZone.coordinates = [];
        this.map.on("mousedown", this.onMouseDownEdit);
    };

    cancelEditZone = () => {
        this.zoneControll.drawZones();
        if (this.editPopup) this.editPopup.remove();
        this.editZone = null;
    };

    onSaveEdit = async () => {
        await this.zoneControll.updateZone(this.editZone);

        if (this.editPopup) this.editPopup.remove();
        this.editZone = null;
    };

    editZoneColor = (e) => {
        const color = e.target.value;
        this.editZone.color = color;
        this.zoneControll.updateZoneColor(this.editZone.id, color);
    };

    editZoneName = (e) => {
        this.editZone.name = e.target.value;
    };

    showEditPopup() {
        const coor = getCenterZoneCoorByCoordinates(this.editZone.coordinates);
        if (!coor) return;

        const popupContainer = document.createElement("div");

        this.editPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setDOMContent(popupContainer)
            .addTo(this.map);

        ReactDOM.render(
            <EditPopup
                color={this.editZone.color}
                name={this.editZone.name}
                onChangeName={this.editZoneName}
                onChangeColor={this.editZoneColor}
                onClickCancel={this.cancelEditZone}
                onClickSave={this.onSaveEdit}
                onClickEdit={this.onGeometryEdit}
            />,
            popupContainer,
        );
    }

    onClickEdit = (e) => {
        const feature = this.getZoneFeatureByEvent(e);
        if (!feature) return;
        const zoneId = feature.properties.id;
        if (this.editZone && zoneId === this.editZone.id) return;
        if (this.editPopup) this.editPopup.remove();
        const zone = this.zoneControll.getZoneById(zoneId);
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
        if (this.isCreateMode) return this.disableCreateMode();
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

    testCLick = () => {
        console.log("testClick");
    };

    setNewZoneName = (e) => {
        this.newZone.name = e.target.value;
    };

    setNewZoneColor = (e) => {
        this.newZone.color = e.target.value;
        this.updateColorInNewZone();
    };

    createZone = () => {
        const zone = _.cloneDeep(this.newZone);
        this.zoneControll.createZone(zone);
        this.onClickCreateButton();
        this.createPopup.remove();
        this.newZonelayer.remove();
        this.newZone = getDefaultZone();
    };

    updateColorInNewZone() {
        this.newZonelayer.setColor(this.newZone.color);
    }

    showCreatePopup() {
        const coor = getCenterZoneCoorByCoordinates(this.newZone.coordinates);
        if (!coor) return;
        const popupContainer = document.createElement("div");
        this.createPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setDOMContent(popupContainer)
            .addTo(this.map);

        const name = this.zoneControll.getNewZoneName();
        this.newZone.name = name;
        ReactDOM.render(
            <CreatePopup
                name={name}
                color={null}
                onChangeName={this.setNewZoneName}
                onChangeColor={this.setNewZoneColor}
                onClickCancel={this.disableCreateMode}
                onClickSave={this.createZone}
            />,
            popupContainer,
        );
    }

    updateNewZoneLayer() {
        if (this.newZone.coordinates.length < 4) return;
        this.newZonelayer.update(this.newZone.coordinates, true);
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

    cancelDeleteZone = () => {
        this.deletePopup.remove();
        this.deleteZoneId = null;
    };

    deleteZone = async () => {
        console.log("delete", this.deleteZoneId);
        await this.zoneControll.deleteZone(this.deleteZoneId);
        this.deletePopup.remove();
        this.deleteZoneId = null;
    };

    showDeletePopup(zoneId) {
        const zone = this.zoneControll.getZoneById(zoneId);
        if (!zone) return;
        const coor = getCenterZoneCoorByCoordinates(zone.coordinates);
        if (!coor) return;
        const popupContainer = document.createElement("div");
        this.deletePopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
        })
            .setLngLat(coor)
            .setDOMContent(popupContainer)
            .addTo(this.map);

        ReactDOM.render(
            <DeletePopup name={zone.name} onClickCancel={this.cancelDeleteZone} onClickDelete={this.deleteZone} />,
            popupContainer,
        );
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
        if (this.isDeleteMode) return this.disableDeleteMode();
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

    getZoneFeatureByEvent(e) {
        const features = this.map.queryRenderedFeatures(e.point);
        if (!features.length) return;
        const feature = features.shift();
        if (!feature) return;
        if (feature.layer.id.match(this.zoneLayerPatternId)) return feature;
    }

    //#endregion
}
