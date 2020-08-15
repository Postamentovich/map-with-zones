import mapboxgl from "mapbox-gl";
import { POPUP_BASE_CLASS_NAME, POPUP_CONTROLS_CLASS_NAME } from "../utils/constants";
import { getPopupInputRadius, getPopupButton, addElementListener } from "../utils/dom-helpers";

export const MarkerLayerEvents = {
    dragend: "dragend",
    radiusChanged: "radiusChanged",
    buttonClick: "buttonClick",
};

export class MarkerLayer extends mapboxgl.Evented {
    radiusInputId = "marker-input-radius";
    radiusButtonId = "marker-button-radius";

    /**
     *
     * @param {mapboxgl.Map} map
     */
    constructor(map) {
        super();
        this.map = map;

        /** @type{mapboxgl.Marker} */
        this.marker = new mapboxgl.Marker({
            draggable: true,
        });

        /** @type{mapboxgl.Popup} */
        this.popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, closeOnMove: false }).setHTML(
            this.getPopupContent(),
        );
    }

    subscribeToPopup() {
        addElementListener(this.radiusInputId, "change", this.onInputChange);
        addElementListener(this.radiusButtonId, "click", this.onButtonClick);
    }

    getPopupContent() {
        return `
        <div class=${POPUP_BASE_CLASS_NAME}>
            ${getPopupInputRadius(1, this.radiusInputId)}
            <div class="${POPUP_CONTROLS_CLASS_NAME}">
                ${getPopupButton("Select", this.radiusButtonId)}
            </div>
        </div>
        `;
    }

    remove() {
        if (this.marker) this.marker.remove();
        if (this.popup) this.popup.remove();
    }

    /**
     * @param {mapboxgl.LngLat} coor
     */
    update(coor) {
        this.marker.setLngLat(coor.toArray());
        this.marker.setPopup(this.popup);
        this.marker.addTo(this.map);
        this.marker.togglePopup();
        this.subscribeToPopup();
        this.marker.on("dragend", this.onDragEnd);
    }

    /**
     *
     * @param {import("react").ChangeEvent<HTMLInputElement>} e
     */
    onInputChange = (e) => {
        this.fire(MarkerLayerEvents.radiusChanged, { radius: Number(e.target.value) });
    };

    onDragEnd = () => {
        const lngLat = this.marker.getLngLat();
        this.fire(MarkerLayerEvents.dragend, { lngLat });
    };

    onButtonClick = () => {
        this.fire(MarkerLayerEvents.buttonClick);
    }
}
