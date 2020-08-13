import { MarkerLayer, MarkerLayerEvents } from "../../layers/marker-layer";

export class UserControll {
    data = {
        lngLat: null,
        radius: null,
        zones: [],
    };

    onAdd(map) {
        /** @type{mapboxgl.Map} */
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl";
        this.init();
        return this.container;
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }

    init() {
        this.markerLayer = new MarkerLayer(this.map);
        this.markerLayer.on(MarkerLayerEvents.dragend, this.handleDragEndMarker);
        this.map.once("click", this.handleMapClick);
    }

    handleDragEndMarker = ({ lngLat }) => {
        this.data.lngLat = lngLat;
    };

    /**
     * @param {mapboxgl.MapMouseEvent & mapboxgl.EventData} e
     */
    handleMapClick = (e) => {
        this.markerLayer.update(e.lngLat);
        this.data.lngLat = e.lngLat;
    };
}
