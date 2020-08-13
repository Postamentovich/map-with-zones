import mapboxgl from "mapbox-gl";

export const MarkerLayerEvents = {
    dragend: "dragend",
    radiusChanged: "radiusChanged",
};

export class MarkerLayer extends mapboxgl.Evented {
    radiusInputId = "marker-input-radius";

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

    subscribeToInput() {
        const input = document.getElementById(this.radiusInputId);
        if (!input) return;
        input.addEventListener("change", this.onInputChange);
    }

    getPopupContent() {
        return `
        <div class='radius-popup'>
            <label for=${this.radiusInputId}>Enter radius</label>
            <input id=${this.radiusInputId} type='number'/>
        </div>
        `;
    }

    /**
     * @param {mapboxgl.LngLat} coor
     */
    update(coor) {
        this.marker.setLngLat(coor.toArray());
        this.marker.setPopup(this.popup);
        this.marker.addTo(this.map);
        this.marker.togglePopup();
        this.subscribeToInput();
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
}
