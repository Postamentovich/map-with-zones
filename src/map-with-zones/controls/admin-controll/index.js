import { ZoneLayer } from "../../layers/zone-layer";
import { generateUniqueId } from "../../utils/generate-unique-id";
import { getPlusIconSvg } from "../../utils/get-plus-icon-svg";
import { getDeleteIconSvg } from "../../utils/get-delete-icon-svg";
import { getEditIconSvg } from "../../utils/get-edit-icon-svg";
import "./index.scss";

export class AdminControll {
    zones = [];
    layers = new Map();
    isAddingMode = false;
    isEditingMode = false;
    isDeletingMode = false;
    pathCoordinates = [];
    buttonClassName = "admin-controll-button";

    /**
     *
     * @param {mapboxgl.Map} map
     */
    onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        const addButton = document.createElement("button");
        addButton.className = `${this.buttonClassName}`;
        addButton.innerHTML = getPlusIconSvg();
        addButton.addEventListener("click", this.onClickAddButton);

        const deleteButton = document.createElement("button");
        deleteButton.className = `${this.buttonClassName}`;
        deleteButton.innerHTML = getDeleteIconSvg();
        deleteButton.addEventListener("click", this.onClickDeleteButton);

        const editButton = document.createElement("button");
        editButton.className = `${this.buttonClassName}`;
        editButton.innerHTML = getEditIconSvg();
        editButton.addEventListener("click", this.onClickEditButton);

        this.container.appendChild(addButton);
        this.container.appendChild(deleteButton);
        this.container.appendChild(editButton);

        this.init();
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    updateZoneLayer() {
        if (this.pathCoordinates.length < 4) return;
        this.layer.update(this.pathCoordinates);
    }

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseUp = (e) => {
        this.map.off("mousemove", this.onMouseMove);
        this.pathCoordinates = [];
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseMove = (e) => {
        this.pathCoordinates.push(e.lngLat.toArray());
        this.updateZoneLayer();
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    onMouseDown = (e) => {
        this.pathCoordinates.push(e.lngLat.toArray());
        this.map.on("mousemove", this.onMouseMove);
        this.map.once("mouseup", this.onMouseUp);
    };

    onClickAddButton = () => {
        if (this.isAddingMode) {
            this.enableMapInteraction();
            this.isAddingMode = false;
        } else {
            const id = generateUniqueId();
            this.layer = new ZoneLayer(this.map, id);
            this.layers.set(id, this.layer);
            this.disableMapInteraction();
            this.map.once("mousedown", this.onMouseDown);
            this.isAddingMode = true;
        }
    };

    enableMapInteraction = () => {
        this.map.dragPan.enable();
        this.map.boxZoom.enable();
        this.map.scrollZoom.enable();
        this.map.dragRotate.enable();
        this.map.doubleClickZoom.enable();
        this.map.touchZoomRotate.enable();
        this.map.touchPitch.enable();
    };

    disableMapInteraction = () => {
        this.map.dragPan.disable();
        this.map.boxZoom.disable();
        this.map.scrollZoom.disable();
        this.map.dragRotate.disable();
        this.map.doubleClickZoom.disable();
        this.map.touchZoomRotate.disable();
        this.map.touchPitch.disable();
    };

    onClickDeleteButton = () => {};

    onClickEditButton = () => {};

    init() {}
}
